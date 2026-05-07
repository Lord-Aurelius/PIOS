import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { FieldReportType, SentimentLabel } from "@prisma/client";
import { TenantGuard } from "../auth/tenant.guard";
import { RequestTenantContext, TenantContext } from "../common/tenant-context";
import { PrismaService } from "../prisma/prisma.service";

class CreateFieldReportDto {
  @IsString() campaignId!: string;
  @IsOptional() @IsString() regionId?: string;
  @IsEnum(FieldReportType) type!: FieldReportType;
  @IsString() title!: string;
  @IsString() body!: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsDateString() occurredAt!: string;
  @IsOptional() @IsString() offlineId?: string;
  @IsOptional() @IsEnum(SentimentLabel) sentiment?: SentimentLabel;
}

@Controller("field-reports")
@UseGuards(TenantGuard)
export class FieldController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@TenantContext() context: RequestTenantContext) {
    return this.prisma.fieldReport.findMany({
      where: { tenantId: context.tenantId },
      include: { region: true, reporter: { select: { name: true } } },
      orderBy: { occurredAt: "desc" }
    });
  }

  @Post()
  create(@TenantContext() context: RequestTenantContext, @Body() body: CreateFieldReportDto) {
    return this.prisma.fieldReport.create({
      data: {
        ...body,
        tenantId: context.tenantId,
        reporterId: context.userId,
        occurredAt: new Date(body.occurredAt),
        syncedAt: new Date()
      }
    });
  }
}
