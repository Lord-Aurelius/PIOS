import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { IsString } from "class-validator";
import { TenantGuard } from "../auth/tenant.guard";
import { RequestTenantContext, TenantContext } from "../common/tenant-context";
import { PrismaService } from "../prisma/prisma.service";

class ResolveAlertDto {
  @IsString() id!: string;
}

@Controller("alerts")
@UseGuards(TenantGuard)
export class AlertsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@TenantContext() context: RequestTenantContext) {
    return this.prisma.alert.findMany({
      where: { tenantId: context.tenantId },
      include: { region: true },
      orderBy: { createdAt: "desc" }
    });
  }

  @Patch("resolve")
  resolve(@TenantContext() context: RequestTenantContext, @Body() body: ResolveAlertDto) {
    return this.prisma.alert.updateMany({
      where: { id: body.id, tenantId: context.tenantId },
      data: { status: "RESOLVED", resolvedAt: new Date() }
    });
  }
}
