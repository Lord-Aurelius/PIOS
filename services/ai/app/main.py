from fastapi import FastAPI

from .models import AnalyzeRequest, BriefingRequest
from .pipelines import analyze_signal, generate_recommendations, optional_llm_summary

app = FastAPI(title="PIOS AI Intelligence Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze/signals")
async def analyze_signals(request: AnalyzeRequest) -> dict[str, object]:
    analyses = [analyze_signal(signal) for signal in request.signals]
    return {
        "tenant_id": request.tenant_id,
        "campaign_id": request.campaign_id,
        "analyses": [item.model_dump() for item in analyses],
        "recommendations": [
            item.model_dump() for item in generate_recommendations(analyses)
        ],
    }


@app.post("/briefings/executive")
async def executive_briefing(request: BriefingRequest) -> dict[str, object]:
    signals = []
    for report in request.reports:
        signals.append(
            {
                "text": f"{report.get('title', '')}. {report.get('body', '')}",
                "source": "field",
                "region": (report.get("region") or {}).get("name"),
                "engagement": 0,
            }
        )
    for post in request.posts:
        signals.append(
            {
                "text": post.get("text", ""),
                "source": post.get("source", "social"),
                "region": (post.get("region") or {}).get("name"),
                "engagement": post.get("engagement", 0),
            }
        )

    analyze_request = AnalyzeRequest(tenant_id=request.tenant_id, signals=signals)
    analyses = [analyze_signal(signal) for signal in analyze_request.signals]
    recommendations = generate_recommendations(analyses)
    campaign_name = (request.campaign or {}).get("name", "the active campaign")
    alert_count = len(request.alerts)
    prompt = (
        f"Write a concise political intelligence briefing for {campaign_name}. "
        f"Open alerts: {alert_count}. Recommendations: "
        f"{'; '.join(item.recommendation for item in recommendations)}"
    )
    llm_summary = await optional_llm_summary(prompt)
    summary = llm_summary or (
        f"{campaign_name} has {alert_count} open alerts and {len(signals)} fresh signals. "
        "Priority action is to respond to emerging negative narratives while reinforcing "
        "high-performing mobilization zones."
    )
    return {
        "summary": summary,
        "recommendations": [item.model_dump() for item in recommendations],
        "signals_reviewed": len(signals),
    }
