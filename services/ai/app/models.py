from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SentimentLabel(str, Enum):
    positive = "POSITIVE"
    neutral = "NEUTRAL"
    negative = "NEGATIVE"
    mixed = "MIXED"


class Signal(BaseModel):
    text: str
    source: str = "unknown"
    region: str | None = None
    engagement: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)


class AnalyzeRequest(BaseModel):
    tenant_id: str
    campaign_id: str | None = None
    signals: list[Signal]


class SignalAnalysis(BaseModel):
    text: str
    sentiment: SentimentLabel
    sentiment_score: float
    topics: list[str]
    crisis_probability: float


class BriefingRequest(BaseModel):
    tenant_id: str
    campaign: dict[str, Any] | None = None
    alerts: list[dict[str, Any]] = Field(default_factory=list)
    reports: list[dict[str, Any]] = Field(default_factory=list)
    posts: list[dict[str, Any]] = Field(default_factory=list)


class Recommendation(BaseModel):
    title: str
    summary: str
    recommendation: str
    confidence: float
    priority: int
    evidence: list[dict[str, Any]] = Field(default_factory=list)
