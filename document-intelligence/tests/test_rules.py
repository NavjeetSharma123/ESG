from uuid import uuid4

from app.extraction.mapping import FrameworkRule, map_datapoint
from app.extraction.rules import EvidenceSpan, extract_candidates


def test_candidate_keeps_source_provenance_and_explicit_value():
    organization_id, document_id = uuid4(), uuid4()
    source = EvidenceSpan("Electricity consumption was 1,200 kWh in FY 2024", 7, "Energy", "table-1")
    points = extract_candidates([source], organization_id, document_id)
    assert len(points) == 1
    point = points[0]
    assert point.value == "1200"
    assert (point.source_page, point.source_section, point.source_table) == (7, "Energy", "table-1")
    assert point.original_text == source.text
    assert point.organization_id == organization_id


def test_ambiguous_multiple_numbers_are_not_assigned():
    point, = extract_candidates([EvidenceSpan("Water consumption was 12 kL in 2023 and 14 kL in 2024", 2)], uuid4(), uuid4())
    assert point.value is None
    assert point.validation_status == "ambiguous"
    assert point.review_status == "needs_review"


def test_mapping_uses_configured_question_id_and_is_not_compliance():
    point, = extract_candidates([EvidenceSpan("Electricity consumption: 20 MWh", 1)], uuid4(), uuid4())
    mappings = map_datapoint(point, [FrameworkRule("GRI", "GRI-302-1", ("electricity consumption",), ("environmental",))])
    assert len(mappings) == 1
    assert mappings[0].question_id == "GRI-302-1"
    assert mappings[0].status == "potentially_relevant"
    assert mappings[0].review_status == "pending"


def test_unconfigured_framework_rules_produce_no_mapping():
    point, = extract_candidates([EvidenceSpan("Electricity consumption: 20 MWh", 1)], uuid4(), uuid4())
    assert map_datapoint(point, []) == []
