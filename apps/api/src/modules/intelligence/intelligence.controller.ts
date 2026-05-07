import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { TenantContext, RequestTenantContext } from "../common/tenant-context";
import { TenantGuard } from "../auth/tenant.guard";
import { IntelligenceService } from "./intelligence.service";

@Controller("intelligence")
@UseGuards(TenantGuard)
export class IntelligenceController {
  constructor(private readonly intelligence: IntelligenceService) {}

  @Get("command-center")
  commandCenter(@TenantContext() context: RequestTenantContext) {
    return this.intelligence.commandCenter(context);
  }

  @Post("briefing")
  briefing(@TenantContext() context: RequestTenantContext) {
    return this.intelligence.generateBriefing(context);
  }
}
