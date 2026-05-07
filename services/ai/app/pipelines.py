from __future__ import annotations

import os
from collections import Counter
from typing import Iterable

import httpx

from .models import Recommendation, SentimentLabel, Signal, SignalAnalysis

NEGATIVE_TERMS = {
    "anger",
    "corruption",
    "violence",
    "unsafe",
    "tax",
    "expensive",
    "hurting",
    "failure",
    "attack",
    "declined",
}
POSITIVE_TERMS = {
    "support",
    "praised",
    "jobs",
    "turnout",
    "strong",
    "organizer",
    "growth",
    "promise",
    "safer",
}
TOPIC_MAP = {
    "tax": "cost_of_living",
    "fuel": "cost_of_living",
    "jobs": "youth_jobs",
    "youth": "youth_jobs",
    "corruption": "governance",
    "violence": "security",
    "unsafe": "security",
    "rally": "mobilization",
    "organizer": "mobilization",
}


def analyze_signal(signal: Signal) -> SignalAnalysis:
    words = [word.strip(".,!?;:()[]").lower() for word in signal.text.split()]
    negative = sum(1 for word in words if word in NEGATIVE_TERMS)
    positive = sum(1 for word in words if word in POSITIVE_TERMS)
    raw_score = positive - negative
    score = max(-1.0, min(1.0, raw_score / max(3, len(words) ** 0.5)))
    if score > 0.12:
        label = SentimentLabel.positive
    elif score < -0.12:
        label = SentimentLabel.negative
    elif positive and negative:
        label = SentimentLabel.mixed
    else:
        label = SentimentLabel.neutral

    topics = sorted({topic for word in words if (topic := TOPIC_MAP.get(word))})
    crisis_probability = min(0.97, max(0.0, negative * 0.18 + signal.engagement / 25000))
    return SignalAnalysis(
        text=signal.text,
        sentiment=label,
        sentiment_score=round(score, 3),
        topics=topics or ["general_mood"],
        crisis_probability=round(crisis_probability, 3),
    )


def generate_recommendations(analyses: Iterable[SignalAnalysis]) -> list[Recommendation]:
    items = list(analyses)
    topics = Counter(topic for item in items for topic in item.topics)
    negative = [item for item in items if item.sentiment == SentimentLabel.negative]
    crisis = [item for item in items if item.crisis_probability >= 0.45]
    recommendations: list[Recommendation] = []

    if negative:
        leading_topic = topics.most_common(1)[0][0]
        recommendations.append(
            Recommendation(
                title=f"Negative {leading_topic.replace('_', ' ')} narrative needs response",
                summary=f"{len(negative)} high-friction signals are shaping the current conversation.",
                recommendation=(
                    "Deploy a localized response message, brief field coordinators, and collect "
                    "fresh doorstep feedback before the next media cycle."
                ),
                confidence=0.82,
                priority=1,
                evidence=[{"topic": leading_topic, "negative_signals": len(negative)}],
            )
        )

    if crisis:
        recommendations.append(
            Recommendation(
                title="Crisis probability threshold crossed",
                summary="Several signals combine high engagement with hostile or urgent language.",
                recommendation=(
                    "Open an incident desk, assign a regional owner, and prepare a candidate-level "
                    "statement if velocity continues for another two hours."
                ),
                confidence=0.76,
                priority=1,
                evidence=[{"crisis_signals": len(crisis)}],
            )
        )

    if not recommendations:
        recommendations.append(
            Recommendation(
                title="Maintain mobilization cadence",
                summary="Current signals do not show a major crisis pattern.",
                recommendation=(
                    "Keep volunteer deployment steady and use regional listening posts to catch "
                    "early narrative shifts."
                ),
                confidence=0.68,
                priority=3,
                evidence=[{"signals_reviewed": len(items)}],
            )
        )

    return recommendations


async def optional_llm_summary(prompt: str) -> str:
    base_url = os.getenv("OLLAMA_BASE_URL")
    model = os.getenv("OLLAMA_MODEL", "mistral")
    if not base_url:
        return ""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post(
                f"{base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            response.raise_for_status()
            return str(response.json().get("response", "")).strip()
    except httpx.HTTPError:
        return ""
