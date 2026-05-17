from __future__ import annotations

from dataclasses import dataclass

from ..schemas import SentimentLabel


POSITIVE_KEYWORDS = (
    "beat",
    "growth",
    "upgrade",
    "profit",
    "strong",
    "record",
    "expands",
    "raises guidance",
    "acquisition",
    "partnership",
)

NEGATIVE_KEYWORDS = (
    "loss",
    "downgrade",
    "lawsuit",
    "decline",
    "warning",
    "weak",
    "investigation",
    "cuts guidance",
    "miss",
    "layoffs",
    "antitrust",
)


@dataclass
class SentimentResult:
    sentiment: SentimentLabel
    confidence: float
    positive_hits: int
    negative_hits: int


def classify_sentiment(title: str, snippet: str) -> SentimentResult:
    text = f"{title} {snippet}".lower()
    positive_hits = sum(keyword in text for keyword in POSITIVE_KEYWORDS)
    negative_hits = sum(keyword in text for keyword in NEGATIVE_KEYWORDS)

    if positive_hits == negative_hits:
        sentiment: SentimentLabel = "Neutral"
    elif positive_hits > negative_hits:
        sentiment = "Positive" if positive_hits - negative_hits >= 1 else "Neutral"
    else:
        sentiment = "Negative" if negative_hits - positive_hits >= 1 else "Neutral"

    if positive_hits and negative_hits and abs(positive_hits - negative_hits) <= 1:
        sentiment = "Neutral"

    signal_hits = positive_hits + negative_hits
    confidence = min(0.94, 0.52 + signal_hits * 0.08 + abs(positive_hits - negative_hits) * 0.06)

    if signal_hits == 0:
        confidence = 0.5

    return SentimentResult(
        sentiment=sentiment,
        confidence=round(confidence, 2),
        positive_hits=positive_hits,
        negative_hits=negative_hits,
    )


def aggregate_sentiments(items: list[dict[str, str | float | None]]) -> dict[str, int | float | str]:
    positive_count = len([item for item in items if item.get("sentiment") == "Positive"])
    negative_count = len([item for item in items if item.get("sentiment") == "Negative"])
    neutral_count = len([item for item in items if item.get("sentiment") == "Neutral"])
    article_count = len(items)

    if positive_count > negative_count:
        overall_sentiment: SentimentLabel = "Positive"
    elif negative_count > positive_count:
        overall_sentiment = "Negative"
    else:
        overall_sentiment = "Neutral"

    avg_confidence = (
        sum(float(item.get("confidence") or 0) for item in items) / article_count if article_count else 0
    )
    balance_bonus = abs(positive_count - negative_count) / article_count if article_count else 0
    confidence = round(min(0.95, avg_confidence * 0.7 + balance_bonus * 0.3), 2) if article_count else 0

    return {
        "overall_sentiment": overall_sentiment,
        "confidence": confidence,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "neutral_count": neutral_count,
        "article_count": article_count,
        "model_name": "local_rule_based_v1",
    }
