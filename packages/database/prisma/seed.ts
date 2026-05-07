import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-progressive-alliance" },
    update: {},
    create: {
      name: "Demo Progressive Alliance",
      slug: "demo-progressive-alliance",
      country: "Kenya",
      brand: {
        primary: "#38bdf8",
        accent: "#f59e0b",
        mark: "DPA"
      }
    }
  });

  const commandRole = await prisma.role.upsert({
    where: { name: "COMMANDER" },
    update: {},
    create: {
      name: "COMMANDER",
      description: "Full campaign command-center access",
      permissions: [
        "command:read",
        "field:write",
        "field:read",
        "gis:read",
        "social:read",
        "ai:read",
        "alerts:manage",
        "crm:manage"
      ]
    }
  });

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "commander@pios.local" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "commander@pios.local",
      name: "Campaign Commander",
      passwordHash: hashPassword("ChangeMe123!")
    }
  });

  const existingCampaign = await prisma.campaign.findFirst({
    where: { tenantId: tenant.id, name: "Nairobi Governor 2027" }
  });

  const party = await prisma.politicalParty.upsert({
    where: { tenantId_abbreviation: { tenantId: tenant.id, abbreviation: "DPA" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Demo Progressive Alliance",
      abbreviation: "DPA",
      color: "#38bdf8",
      ideology: "Service delivery, accountability, youth employment",
      strongholds: ["Kibra", "Embakasi East"],
      influenceScore: 0.64,
      sentimentScore: 0.22,
      riskFactors: ["National tax debate spillover", "Urban service delivery fatigue"]
    }
  });

  const campaign =
    existingCampaign ??
    (await prisma.campaign.create({
      data: {
        tenantId: tenant.id,
        partyId: party.id,
        name: "Nairobi Governor 2027",
        candidate: "Amina Wekesa",
        office: "Governor",
        status: "ACTIVE",
        electionDate: new Date("2027-08-10T06:00:00Z"),
        strategy: {
          persuasionTargets: ["youth", "market traders", "public transport workers"],
          coreMessage: "Accountable services, jobs, and safer neighborhoods"
        }
      }
    }));

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, roleId: commandRole.id, campaignId: campaign.id }
  });
  if (!membership) {
    await prisma.membership.create({
      data: { userId: user.id, roleId: commandRole.id, campaignId: campaign.id }
    });
  }

  const regions = await Promise.all(
    [
      ["NAI-WEST", "Nairobi West", "CONSTITUENCY", -1.314, 36.812, 146000, 88300],
      ["KIBRA", "Kibra", "CONSTITUENCY", -1.313, 36.789, 185000, 109000],
      ["EMBAKASI", "Embakasi East", "CONSTITUENCY", -1.285, 36.913, 210000, 126000]
    ].map(([code, name, level, lat, lng, population, voters]) =>
      prisma.geoRegion.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: String(code) } },
        update: {},
        create: {
          tenantId: tenant.id,
          code: String(code),
          name: String(name),
          level: level as "CONSTITUENCY",
          centroidLat: Number(lat),
          centroidLng: Number(lng),
          population: Number(population),
          registeredVoters: Number(voters),
          properties: { swingIndex: 0.63, oppositionActivity: 0.41 }
        }
      })
    )
  );

  await prisma.candidateVisit.createMany({
    data: [
      {
        campaignId: campaign.id,
        regionId: regions[1].id,
        title: "Laini Saba women organizer forum",
        visitType: "Town hall",
        latitude: -1.315,
        longitude: 36.792,
        attendance: 780,
        sentimentScore: 0.48,
        occurredAt: new Date()
      },
      {
        campaignId: campaign.id,
        regionId: regions[0].id,
        title: "Matatu stage listening tour",
        visitType: "Listening tour",
        latitude: -1.313,
        longitude: 36.814,
        attendance: 220,
        sentimentScore: -0.18,
        occurredAt: new Date()
      }
    ],
    skipDuplicates: true
  });

  await prisma.voterRegisterImport.create({
    data: {
      tenantId: tenant.id,
      sourceName: "IEBC Registered Voters Per Polling Station",
      sourceType: "PDF",
      fileName: "iebc-registered-voters-demo.pdf",
      status: "PARSED",
      rowsParsed: 40883,
      votersTotal: 19611423
    }
  });

  await prisma.fieldReport.createMany({
    data: [
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        reporterId: user.id,
        regionId: regions[0].id,
        type: "COMMUNITY_ISSUE",
        title: "Fuel tax anger in matatu stages",
        body: "Youth and drivers raised cost-of-living concerns after the fuel tax debate.",
        latitude: -1.313,
        longitude: 36.814,
        occurredAt: new Date(),
        sentiment: "NEGATIVE",
        confidence: 0.82
      },
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        reporterId: user.id,
        regionId: regions[1].id,
        type: "RALLY_ATTENDANCE",
        title: "Strong turnout at Laini Saba rally",
        body: "Attendance exceeded estimates, with strong women organizer presence.",
        latitude: -1.315,
        longitude: 36.792,
        occurredAt: new Date(),
        sentiment: "POSITIVE",
        confidence: 0.88
      }
    ]
  });

  await prisma.socialPost.createMany({
    data: [
      {
        tenantId: tenant.id,
        regionId: regions[0].id,
        source: "x",
        externalId: "demo-1",
        authorHandle: "@nairobivoices",
        text: "Fuel prices are hurting families. Candidates must answer clearly.",
        sentiment: "NEGATIVE",
        sentimentScore: -0.67,
        engagement: 4200,
        topics: ["fuel_tax", "cost_of_living"],
        hashtags: ["FuelTax", "NairobiDecides"]
      },
      {
        tenantId: tenant.id,
        regionId: regions[2].id,
        source: "radio",
        externalId: "demo-2",
        authorHandle: "East FM",
        text: "Callers praised the candidate's promise on youth job centers.",
        sentiment: "POSITIVE",
        sentimentScore: 0.58,
        engagement: 900,
        topics: ["jobs", "youth"],
        hashtags: []
      }
    ],
    skipDuplicates: true
  });

  await prisma.aiInsight.createMany({
    data: [
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        type: "RISK",
        title: "Cost-of-living narrative accelerating",
        summary: "Negative fuel-tax discussion is concentrated in Nairobi West transport corridors.",
        recommendation: "Deploy a targeted affordability message and schedule listening sessions within 7 days.",
        confidence: 0.84,
        priority: 1,
        evidence: [{ region: "Nairobi West", signal: "social + field reports" }]
      },
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        type: "MOBILIZATION",
        title: "Kibra organizer network is outperforming",
        summary: "Rally attendance and volunteer density indicate a high-opportunity mobilization zone.",
        recommendation: "Increase volunteer kits and retain women organizer leads for household visits.",
        confidence: 0.78,
        priority: 2,
        evidence: [{ region: "Kibra", signal: "rally attendance" }]
      }
    ]
  });

  await prisma.alert.create({
    data: {
      tenantId: tenant.id,
      regionId: regions[0].id,
      severity: "HIGH",
      title: "Sentiment decline in Nairobi West",
      message: "Youth support declined after fuel-tax discussion; social velocity is above threshold.",
      channels: ["in_app", "whatsapp"],
      ruleKey: "sentiment_drop_region"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
