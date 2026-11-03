"""Config-driven, explainable mapping to framework question identifiers."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from .rules import ExtractedDataPoint


@dataclass(frozen=True)
class FrameworkRule:
    framework: str
    question_id: str
    terms: tuple[str, ...]
    categories: tuple[str, ...] = ()


@dataclass(frozen=True)
class FrameworkMapping:
    datapoint_id: str
    framework: str
    question_id: str
    rule: str
    status: str
    supporting_evidence: str
    review_status: str = "pending"


def map_datapoint(point: ExtractedDataPoint, rules: Iterable[FrameworkRule]) -> list[FrameworkMapping]:
    mappings: list[FrameworkMapping] = []
    for rule in rules:
        if rule.categories and point.category not in rule.categories:
            continue
        matches = [term for term in rule.terms if re.search(rf"(?<!\w){re.escape(term)}(?!\w)", f"{point.name} {point.original_text}", re.IGNORECASE)]
        if not matches:
            continue
        mappings.append(FrameworkMapping(
            datapoint_id=str(point.id), framework=rule.framework,
            question_id=rule.question_id,
            rule=f"literal terms matched: {', '.join(matches)}",
            status="potentially_relevant", supporting_evidence=point.original_text,
        ))
    return mappings
