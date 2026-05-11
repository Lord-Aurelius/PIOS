import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { TenantGuard } from "../auth/tenant.guard";
import { RequestTenantContext, TenantContext } from "../common/tenant-context";
import { PrismaService } from "../prisma/prisma.service";

class IngestSocialPostDto {
  @IsString() source!: string;
  @IsString() externalId!: string;
  @IsString() authorHandle!: string;
  @IsString() text!: string;
  @IsOptional() @IsString() regionId?: string;
  @IsOptional() @IsNumber() engagement?: number;
  @IsOptional() @IsArray() topics?: string[];
  @IsOptional() @IsArray() hashtags?: string[];
}

class PublishSocialMessageDto {
  @IsString() message!: string;
  @IsOptional() @IsString() period?: string;
  @IsOptional() @IsString() asset?: string;
  @IsArray() handles!: Array<{ network: string; handle: string }>;
}

@Controller("social")
@UseGuards(TenantGuard)
export class SocialController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("posts")
  posts(@TenantContext() context: RequestTenantContext) {
    return this.prisma.socialPost.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { detectedAt: "desc" },
      take: 100,
      include: { region: true }
    });
  }

  @Post("ingest")
  ingest(@TenantContext() context: RequestTenantContext, @Body() body: IngestSocialPostDto) {
    return this.prisma.socialPost.upsert({
      where: {
        tenantId_source_externalId: {
          tenantId: context.tenantId,
          source: body.source,
          externalId: body.externalId
        }
      },
      update: { text: body.text, engagement: body.engagement ?? 0 },
      create: {
        tenantId: context.tenantId,
        source: body.source,
        externalId: body.externalId,
        authorHandle: body.authorHandle,
        text: body.text,
        regionId: body.regionId,
        engagement: body.engagement ?? 0,
        topics: body.topics ?? [],
        hashtags: body.hashtags ?? []
      }
    });
  }
}

@Controller("public/social")
export class PublicSocialController {
  private readonly platformSlug = "house-aurelius-platform";

  constructor(private readonly prisma: PrismaService) {}

  @Post("publish")
  async publish(@Body() body: PublishSocialMessageDto) {
    const tenant = await this.prisma.tenant.upsert({
      where: { slug: this.platformSlug },
      update: {},
      create: {
        name: "House Aurelius Platform",
        slug: this.platformSlug,
        country: "Kenya",
        brand: {}
      }
    });
    const config = (tenant.aiConfig ?? {}) as Record<string, unknown>;
    const publication = {
      id: `publication-${Date.now()}`,
      message: body.message,
      period: body.period ?? "",
      asset: body.asset ?? "",
      handles: body.handles,
      status: "QUEUED_FOR_PLATFORM_DELIVERY",
      note: "Queued against connected handles. Platform OAuth tokens are required before live posting can be completed.",
      createdAt: new Date().toISOString()
    };
    const publicationLog = Array.isArray(config.publicationLog) ? config.publicationLog : [];
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { aiConfig: { ...config, publicationLog: [publication, ...publicationLog].slice(0, 100) } }
    });
    return publication;
  }
}
