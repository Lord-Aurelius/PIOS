import { Body, Controller, Get, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IsOptional, IsString, MinLength } from "class-validator";
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
        errors: findings.errors as Prisma.InputJsonValue
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
