import { PublicSurveyForm } from "@/components/public-survey-form";

export default async function PublicSurveyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicSurveyForm slug={slug} />;
}
