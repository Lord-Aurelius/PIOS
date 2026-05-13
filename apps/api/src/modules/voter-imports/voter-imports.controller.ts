import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { GeoLevel, Prisma } from "@prisma/client";
import { IsArray, IsOptional, IsString, MinLength } from "class-validator";
import { PDFParse } from "pdf-parse";
import { PrismaService } from "../prisma/prisma.service";

class VoterImportUploadDto {
  @IsString()
  @MinLength(3)
  fileName!: string;

  @IsString()
  @MinLength(20)
  fileBase64!: string;

  @IsOptional()
  @IsString()
  sourceName?: string;
}

class ApplyVoterImportDto {
  @IsArray()
  regions!: Array<{ name: string; registeredVoters: number }>;
}

@Controller("public/voter-imports")
export class VoterImportsController {
  private readonly platformSlug = "house-aurelius-platform";

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listImports() {
    const tenant = await this.ensurePlatformTenant();
    return this.prisma.voterRegisterImport.findMany({
      where: { tenantId: tenant.id },
      orderBy: { importedAt: "desc" },
      take: 20
    });
  }

  @Get("gis-regions")
  async listGisRegions() {
    const tenant = await this.ensurePlatformTenant();
    return this.prisma.geoRegion.findMany({
      where: {
        tenantId: tenant.id,
        properties: {
          path: ["source"],
          equals: "voter-register-import"
        }
      },
      orderBy: [{ registeredVoters: "desc" }, { name: "asc" }]
    });
  }

  @Post()
  async uploadImport(@Body() body: VoterImportUploadDto) {
    const tenant = await this.ensurePlatformTenant();
    const buffer = Buffer.from(this.stripDataUrlPrefix(body.fileBase64), "base64");
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const findings = this.extractVoterCounts(parsed.text);
    const status = findings.votersTotal > 0 ? "READY_FOR_REVIEW" : "NEEDS_REVIEW";

    const record = await this.prisma.voterRegisterImport.create({
      data: {
        tenantId: tenant.id,
        sourceName: body.sourceName ?? "Uploaded voter register",
        sourceType: "PDF",
        fileName: body.fileName,
        status,
        rowsParsed: findings.rowsParsed,
        votersTotal: findings.votersTotal,
        errors: { errors: findings.errors, regions: findings.regions } as Prisma.InputJsonValue
      }
    });

    return {
      id: record.id,
      fileName: record.fileName,
      status: record.status,
      progress: 100,
      rowsParsed: record.rowsParsed,
      votersTotal: record.votersTotal,
      regions: findings.regions,
      errors: findings.errors,
      importedAt: record.importedAt
    };
  }

  @Post(":id/apply")
  async applyImport(@Param("id") id: string, @Body() body: ApplyVoterImportDto) {
    const tenant = await this.ensurePlatformTenant();
    const record = await this.prisma.voterRegisterImport.findFirst({
      where: { id, tenantId: tenant.id }
    });
    if (!record) {
      return { ok: false, message: "Voter register import was not found." };
    }

    const regions = this.normalizeRegions(body.regions);
    const appliedRegions = await this.prisma.$transaction(
      regions.map((region) =>
        this.prisma.geoRegion.upsert({
          where: { tenantId_code: { tenantId: tenant.id, code: this.regionCode(region.name) } },
          update: {
            name: region.name,
            level: GeoLevel.POLLING_STATION,
            registeredVoters: region.registeredVoters,
            properties: {
              source: "voter-register-import",
              sourceImportId: record.id,
              sourceFileName: record.fileName,
              intelligenceStatus: "actionable"
            } as Prisma.InputJsonValue
          },
          create: {
            tenantId: tenant.id,
            code: this.regionCode(region.name),
            name: region.name,
            level: GeoLevel.POLLING_STATION,
            registeredVoters: region.registeredVoters,
            properties: {
              source: "voter-register-import",
              sourceImportId: record.id,
              sourceFileName: record.fileName,
              intelligenceStatus: "actionable"
            } as Prisma.InputJsonValue
          }
        })
      )
    );

    await this.prisma.voterRegisterImport.update({
      where: { id: record.id },
      data: { status: "APPLIED_TO_GIS" }
    });

    return {
      ok: true,
      status: "APPLIED_TO_GIS",
      regionsApplied: appliedRegions.length,
      votersTotal: appliedRegions.reduce((sum, region) => sum + (region.registeredVoters ?? 0), 0),
      regions: appliedRegions.map((region) => ({
        code: region.code,
        name: region.name,
        registeredVoters: region.registeredVoters ?? 0
      }))
    };
  }

  @Delete(":id")
  async deleteImport(@Param("id") id: string) {
    const tenant = await this.ensurePlatformTenant();
    await this.prisma.geoRegion.deleteMany({
      where: {
        tenantId: tenant.id,
        properties: {
          path: ["sourceImportId"],
          equals: id
        }
      }
    });
    await this.prisma.voterRegisterImport.deleteMany({
      where: { id, tenantId: tenant.id }
    });
    return { ok: true, deletedImportId: id };
  }

  private stripDataUrlPrefix(value: string) {
    return value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
  }

  private extractVoterCounts(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const regions: Array<{ name: string; registeredVoters: number }> = [];
    const errors: Array<{ line?: string; message: string }> = [];

    for (const line of lines) {
      const match = line.match(/^(.{3,80}?)\s+(\d{1,3}(?:,\d{3})+|\d{4,})$/);
      if (!match) continue;
      const name = match[1].replace(/[^A-Za-z0-9\s'./-]/g, "").trim();
      const registeredVoters = Number(match[2].replace(/,/g, ""));
      if (!name || !Number.isFinite(registeredVoters)) continue;
      if (/total|registered voters|polling station|constituency|county/i.test(name) && registeredVoters < 1000) continue;
      regions.push({ name, registeredVoters });
    }

    if (!regions.length) {
      errors.push({
        message: "No voter-count table rows were confidently extracted. The PDF may be scanned, encrypted, or formatted as an image."
      });
    }

    return {
      rowsParsed: regions.length,
      votersTotal: regions.reduce((sum, region) => sum + region.registeredVoters, 0),
      regions: regions.slice(0, 100),
      errors
    };
  }

  private normalizeRegions(regions: Array<{ name: string; registeredVoters: number }> = []) {
    const seen = new Map<string, { name: string; registeredVoters: number }>();
    for (const region of regions) {
      const name = String(region.name ?? "").replace(/\s+/g, " ").trim();
      const registeredVoters = Number(region.registeredVoters);
      if (!name || !Number.isFinite(registeredVoters) || registeredVoters < 1) continue;
      const key = this.regionCode(name);
      const existing = seen.get(key);
      seen.set(key, {
        name,
        registeredVoters: (existing?.registeredVoters ?? 0) + Math.round(registeredVoters)
      });
    }
    return [...seen.values()].slice(0, 500);
  }

  private regionCode(name: string) {
    return name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 58) || `REGION-${Date.now()}`;
  }

  private async ensurePlatformTenant() {
    return this.prisma.tenant.upsert({
      where: { slug: this.platformSlug },
      update: {},
      create: {
        name: "House Aurelius Platform",
        slug: this.platformSlug,
        country: "Kenya",
        brand: {}
      }
    });
  }
}
