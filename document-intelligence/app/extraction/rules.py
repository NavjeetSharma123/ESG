"""Transparent keyword rules for candidate discovery, never compliance decisions."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable
from uuid import UUID, uuid4

from .normalization import extract_numeric_values, identify_reporting_period, normalize_unit


@dataclass(frozen=True)
class EvidenceSpan:
    text: str
    page_number: int | None
    section: str | None = None
    table_id: str | None = None
    extraction_method: str = "docling"


@dataclass(frozen=True)
class DataPointRule:
    name: str
    category: str
    terms: tuple[str, ...]
    unit_pattern: str | None = None


@dataclass(frozen=True)
class ExtractedDataPoint:
    id: UUID
    organization_id: UUID
    document_id: UUID
    category: str
    name: str
    original_text: str
    value: str | None
    unit: str | None
    reporting_period: str | None
    source_page: int | None
    source_section: str | None
    source_table: str | None
    extraction_method: str
    validation_status: str
    review_status: str


DEFAULT_RULES = (
    DataPointRule("Electricity consumption", "environmental", ("electricity consumption", "electricity consumed", "power consumption"), r"kwh|mwh"),
    DataPointRule("Fuel consumption", "environmental", ("fuel consumption", "diesel consumed", "natural gas consumption")),
    DataPointRule("Water consumption", "environmental", ("water consumption", "water withdrawn", "water consumed"), r"litres?|liters?|kl|m³|m3"),
    DataPointRule("Waste generation", "environmental", ("waste generated", "waste generation", "total waste"), r"kg|tonnes?|tons?"),
    DataPointRule("Greenhouse gas emissions", "environmental", ("greenhouse gas emissions", "ghg emissions", "carbon emissions"), r"t\s*co2e|kg\s*co2e|tco2e|kgco2e"),
    DataPointRule("Renewable energy", "environmental", ("renewable energy", "renewable electricity")),
    DataPointRule("Scope 1 emissions", "environmental", ("scope 1 emissions", "scope one emissions"), r"t\s*co2e|kg\s*co2e|tco2e|kgco2e"),
    DataPointRule("Scope 2 emissions", "environmental", ("scope 2 emissions", "scope two emissions"), r"t\s*co2e|kg\s*co2e|tco2e|kgco2e"),
    DataPointRule("Scope 3 emissions", "environmental", ("scope 3 emissions", "scope three emissions"), r"t\s*co2e|kg\s*co2e|tco2e|kgco2e"),
    DataPointRule("Employee count", "social", ("employee count", "number of employees", "total employees")),
    DataPointRule("Gender diversity", "social", ("gender diversity", "women employees", "female employees"), r"%|percent|percentage"),
    DataPointRule("Employee turnover", "social", ("employee turnover", "staff turnover"), r"%|percent|percentage"),
    DataPointRule("Training hours", "social", ("training hours", "hours of training"), r"hours?"),
    DataPointRule("Workplace accidents", "social", ("workplace accidents", "work-related injuries", "recordable injuries")),
    DataPointRule("Occupational health and safety", "social", ("occupational health and safety", "health and safety incidents")),
    DataPointRule("Board composition", "governance", ("board composition", "board members")),
    DataPointRule("Board diversity", "governance", ("board diversity", "women on the board"), r"%|percent|percentage"),
    DataPointRule("Ethics policy", "governance", ("ethics policy", "code of ethics")),
    DataPointRule("Anti-corruption training", "governance", ("anti-corruption training", "anti bribery training")),
    DataPointRule("Whistleblower complaints", "governance", ("whistleblower complaints", "whistle-blower complaints")),
)


def extract_candidates(
    spans: Iterable[EvidenceSpan], organization_id: UUID, document_id: UUID,
    rules: Iterable[DataPointRule] = DEFAULT_RULES,
) -> list[ExtractedDataPoint]:
    """Find explicit topic/value co-occurrences. Keep qualitative mentions as candidates.

    A numeric value is attached only when exactly one number occurs in the same
    source span. Multiple numbers are marked for review and left unassigned.
    """
    candidates: list[ExtractedDataPoint] = []
    seen: set[tuple[str, int | None, str]] = set()
    for span in spans:
        text = span.text or ""
        numbers = extract_numeric_values(text)
        periods = identify_reporting_period(text)
        for rule in rules:
            if not any(re.search(rf"(?<!\w){re.escape(term)}(?!\w)", text, re.IGNORECASE) for term in rule.terms):
                continue
            if rule.unit_pattern and not re.search(rule.unit_pattern, text, re.IGNORECASE):
                continue
            identity = (rule.name, span.page_number, text)
            if identity in seen:
                continue
            seen.add(identity)
            status = "needs_review" if len(numbers) > 1 else "candidate"
            matched_unit = re.search(rule.unit_pattern, text, re.IGNORECASE) if rule.unit_pattern else None
            normalized_unit = normalize_unit(matched_unit.group(0)) if matched_unit else None
            candidates.append(ExtractedDataPoint(
                id=uuid4(), organization_id=organization_id, document_id=document_id,
                category=rule.category, name=rule.name, original_text=text,
                value=str(numbers[0].value) if len(numbers) == 1 else None,
                unit=normalized_unit.canonical if normalized_unit else matched_unit.group(0) if matched_unit else None,
                reporting_period=periods[0] if len(periods) == 1 else None,
                source_page=span.page_number, source_section=span.section,
                source_table=span.table_id, extraction_method=span.extraction_method,
                validation_status="ambiguous" if len(periods) > 1 or len(numbers) > 1 else "unvalidated",
                review_status="needs_review" if status == "needs_review" or len(periods) > 1 else "pending",
            ))
    return candidates
