import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IsObject } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";

class PublicSurveyResponseDto {
  @IsObject()
  answers!: Record<string, unknown>;
}

@Controller("public/surveys")
export class SurveysController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("responses")
  async listResponses() {
    const responses = await this.prisma.surveyResponse.findMany({
      orderBy: { submittedAt: "desc" },
      take: 100,
      include: { survey: { include: { publicLinks: true } } }
    });
    return responses.map((response) => ({
      id: response.id,
      slug: response.survey.publicLinks[0]?.slug ?? response.surveyId,
      submittedAt: response.submittedAt,
      answers: response.answers
    }));
  }

  @Post(":slug/responses")
  async submitResponse(@Param("slug") slug: string, @Body() body: PublicSurveyResponseDto) {
    const link = await this.ensureSurveyLink(slug);
    const response = await this.prisma.surveyResponse.create({
      data: {
        surveyId: link.surveyId,
        answers: body.answers as Prisma.InputJsonValue,
        sentimentScore: this.scoreSentiment(body.answers)
      }
    });

    await this.prisma.publicSurveyLink.update({
      where: { id: link.id },
      data: { submissions: { increment: 1 } }
    });

    await this.prisma.aiInsight.create({
      data: {
        tenantId: link.survey.campaign.tenantId,
        campaignId: link.survey.campaignId,
        type: "RECOMMENDATION",
        title: "Fresh public survey response",
        summary: `A new QR survey response was submitted for ${link.title}.`,
        recommendation: "Review the response cluster and update ward-level messaging if the issue repeats.",
        confidence: 0.72,
        priority: 2,
        evidence: [{ source: "public_survey", slug, responseId: response.id }]
      }
    });

    return {
      id: response.id,
      slug,
      submittedAt: response.submittedAt,
      answers: response.answers
    };
  }

  private async ensureSurveyLink(slug: string) {
    const existing = await this.prisma.publicSurveyLink.findUnique({
      where: { slug },
      include: { survey: { include: { campaign: true } } }
    });
    if (existing) return existing;

    const campaign = await this.prisma.campaign.findFirst({
      orderBy: { createdAt: "asc" }
    });
    if (!campaign) {
      throw new Error("No campaign exists for public survey submission.");
    }
    const survey = await this.prisma.survey.create({
      data: {
        campaignId: campaign.id,
        name: slug.replaceAll("-", " "),
        description: "Public QR field survey",
        schema: {}
      }
    });
    return this.prisma.publicSurveyLink.create({
      data: {
        surveyId: survey.id,
        slug,
        title: survey.name
      },
      include: { survey: { include: { campaign: true } } }
    });
  }

  private scoreSentiment(answers: Record<string, unknown>) {
    const text = JSON.stringify(answers).toLowerCase();
    if (text.includes("strong supporter") || text.includes("persuasive")) return 0.7;
    if (text.includes("opponent") || text.includes("angry")) return -0.7;
    if (text.includes("undecided")) return -0.1;
    return 0;
  }
}
