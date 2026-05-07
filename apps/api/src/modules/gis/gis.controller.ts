import { Controller, Get, UseGuards } from "@nestjs/common";
import { TenantGuard } from "../auth/tenant.guard";
import { RequestTenantContext, TenantContext } from "../common/tenant-context";
import { PrismaService } from "../prisma/prisma.service";

@Controller("gis")
@UseGuards(TenantGuard)
export class GisController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("regions.geojson")
  async regions(@TenantContext() context: RequestTenantContext) {
    const regions = await this.prisma.geoRegion.findMany({ where: { tenantId: context.tenantId } });
    return {
      type: "FeatureCollection",
      features: regions.map((region) => ({
        type: "Feature",
        id: region.id,
        geometry:
          region.geojson ??
          {
            type: "Point",
            coordinates: [region.centroidLng ?? 0, region.centroidLat ?? 0]
          },
        properties: {
          code: region.code,
          name: region.name,
          level: region.level,
          population: region.population,
          registeredVoters: region.registeredVoters,
          ...(typeof region.properties === "object" && region.properties !== null && !Array.isArray(region.properties)
            ? region.properties
            : {})
        }
      }))
    };
  }
}
