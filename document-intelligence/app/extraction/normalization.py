"""Deterministic normalization helpers that retain source representations."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from decimal import Decimal, InvalidOperation
from hashlib import sha256


@dataclass(frozen=True)
class NumericValue:
    value: Decimal
    original: str


@dataclass(frozen=True)
class NormalizedUnit:
    original: str
    canonical: str
    multiplier_to_canonical: Decimal


_NUMBER = re.compile(r"(?<![\w.])[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?(?![\w.])")
_UNITS: dict[str, NormalizedUnit] = {}
for aliases, canonical, multiplier in (
    (("kwh", "kilowatt hour", "kilowatt-hours"), "kWh", "1"),
    (("mwh", "megawatt hour", "megawatt-hours"), "MWh", "1"),
    (("l", "litre", "litres", "liter", "liters"), "L", "1"),
    (("kl", "kilolitre", "kilolitres", "kiloliter", "kiloliters"), "kL", "1"),
    (("m3", "m³", "cubic metre", "cubic metres", "cubic meter", "cubic meters"), "m³", "1"),
    (("kg", "kilogram", "kilograms"), "kg", "1"),
    (("t", "tonne", "tonnes", "metric ton", "metric tons"), "t", "1"),
    (("tco2e", "t co2e", "tonnes co2e", "tonnes of co2e"), "tCO2e", "1"),
    (("kgco2e", "kg co2e", "kilograms co2e"), "kgCO2e", "1"),
    (("%", "percent", "percentage"), "%", "1"),
):
    for alias in aliases:
        _UNITS[alias.casefold()] = NormalizedUnit(alias, canonical, Decimal(multiplier))


def extract_numeric_values(text: str) -> list[NumericValue]:
    """Return numbers as printed; no missing values or context are inferred."""
    result: list[NumericValue] = []
    source = text or ""
    period_spans = []
    period_pattern = re.compile(
        r"\b(?:FY\s*)?(?:19|20)\d{2}\s*[-–/]\s*(?:(?:FY\s*)?(?:19|20)?\d{2})\b"
        r"|\b(?:FY\s*)?(?:19|20)\d{2}\b"
        r"|\b(?:Q[1-4]\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2}\b",
        re.IGNORECASE,
    )
    period_spans = [match.span() for match in period_pattern.finditer(source)]
    for match in _NUMBER.finditer(source):
        if any(match.start() < end and start < match.end() for start, end in period_spans):
            continue
        original = match.group(0)
        raw = original[:-1] if original.endswith("%") else original
        try:
            value = Decimal(raw.replace(",", ""))
        except InvalidOperation:
            continue
        result.append(NumericValue(value=value, original=original))
    return result


def normalize_unit(unit: str) -> NormalizedUnit | None:
    """Canonicalize known units without changing magnitude."""
    return _UNITS.get((unit or "").strip().casefold())


def identify_reporting_period(text: str) -> tuple[str, ...]:
    """Find explicit year or date-range mentions, preserving their printed form."""
    pattern = (
        r"\b(?:FY\s*)?(?:19|20)\d{2}\s*[-–/]\s*(?:(?:FY\s*)?(?:19|20)?\d{2})\b"
        r"|\b(?:FY\s*)?(?:19|20)\d{2}\b"
        r"|\b(?:Q[1-4]\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2}\b"
    )
    return tuple(match.group(0).strip() for match in re.finditer(pattern, text or "", re.IGNORECASE))


def normalize_date(value: str) -> date | None:
    """Parse unambiguous ISO dates only; ambiguous locale dates are left for review."""
    try:
        return date.fromisoformat(value.strip())
    except (ValueError, AttributeError):
        return None


def normalize_currency(value: str) -> tuple[Decimal, str] | None:
    """Return an explicit amount and currency code without exchange conversion."""
    match = re.search(r"(?P<symbol>₹|\$|€|£|INR|USD|EUR|GBP)\s*(?P<amount>[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)", value or "", re.IGNORECASE)
    if not match:
        return None
    code = {"₹": "INR", "$": "USD", "€": "EUR", "£": "GBP"}.get(match.group("symbol"), match.group("symbol").upper())
    try:
        return Decimal(match.group("amount").replace(",", "")), code
    except InvalidOperation:
        return None


def validate_range(value: Decimal, minimum: Decimal | None = None, maximum: Decimal | None = None) -> tuple[bool, str | None]:
    """Check caller-supplied bounds; no generic emissions/ESG assumptions are made."""
    if minimum is not None and value < minimum:
        return False, f"Value is below configured minimum {minimum}"
    if maximum is not None and value > maximum:
        return False, f"Value is above configured maximum {maximum}"
    return True, None


def content_fingerprint(category: str, name: str, page: int | None, original_text: str) -> str:
    """Stable duplicate key scoped by semantic label and source location."""
    material = "\0".join((category.strip().casefold(), name.strip().casefold(), str(page or ""), original_text.strip()))
    return sha256(material.encode("utf-8")).hexdigest()


def normalize_table_rows(rows: list[list[str]]) -> list[dict[str, str]]:
    """Normalize ragged rows against the first row while preserving cell text."""
    if not rows:
        return []
    headers = [cell.strip() or f"column_{index + 1}" for index, cell in enumerate(rows[0])]
    result = []
    for row in rows[1:]:
        padded = row[: len(headers)] + [""] * max(0, len(headers) - len(row))
        result.append({header: (padded[index] or "").strip() for index, header in enumerate(headers)})
    return result

