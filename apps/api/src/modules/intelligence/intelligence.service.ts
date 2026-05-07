import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RequestTenantContext } from "../common/tenant-context";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async commandCenter(context: RequestTenantContext) {
    const [campaign, reports, alerts, posts, insights, regions] = await Promise.all([
      this.prisma.campaign.findFirst({ where: { tenantId: context.tenantId, status: "ACTIVE" } }),
      this.prisma.fieldReport.findMany({
        where: { tenantId: context.tenantId },
        orderBy: { occurredAt: "desc" },
        take: 8,
        include: { region: true, reporter: { select: { name: true } } }
      }),
      this.prisma.alert.findMany({
        where: { tenantId: context.tenantId, status: "OPEN" },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 6,
        include: { region: true }
      }),
      this.prisma.socialPost.findMany({
        where: { tenantId: context.tenantId },
        orderBy: { detectedAt: "desc" },
        take: 10,
        include: { region: true }
      }),
      this.prisma.aiInsight.findMany({
        where: { tenantId: context.tenantId },
        orderBy: [{ priority: "asc" }, { generatedAt: "desc" }],
        take: 6
      }),
      this.prisma.geoRegion.findMany({ where: { tenantId: context.tenantId } })
    ]);

    const negativePosts = posts.filter((post) => post.sentiment === "NEGATIVE").length;
    const positiveReports = reports.filter((report) => report.sentiment === "POSITIVE").length;
    const totalSignals = posts.length + reports.length;

    return {
      campaign,
      metrics: [
        { label: "Win probability", value: "57%", change: 4.2, tone: "positive" },
        { label: "Active alerts", value: String(alerts.length), change: alerts.length > 2 ? -8.1 : 1.5, tone: alerts.length > 2 ? "negative" : "neutral" },
        { label: "Positive field signals", value: String(positiveReports), change: 6.4, tone: "positive" },
        { label: "Negative social spikes", value: String(negativePosts), change: negativePosts > 1 ? -12 : 0.8, tone: negativePosts > 1 ? "negative" : "neutral" }
      ],
      reports,
      alerts,
      posts,
      insights,
      regions,
      signalMix: {
        totalSignals,
        social: posts.length,
        field: reports.length,
        oppositionActivity: reports.filter((r) => r.type === "OPPOSITION_ACTIVITY").length
      }
    };
  }

  async generateBriefing(context: RequestTenantContext) {
    const signals = await this.commandCenter(context);
    const aiUrl = this.config.get<string>("AI_SERVICE_URL", "http://localhost:8000");
    const response = await fetch(`${aiUrl}/briefings/executive`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenant_id: context.tenantId,
        campaign: signals.campaign,
        alerts: signals.alerts,
        reports: signals.reports,
        posts: signals.posts
      })
    });
    return response.json();
  }
}
