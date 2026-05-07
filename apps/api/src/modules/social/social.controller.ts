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
