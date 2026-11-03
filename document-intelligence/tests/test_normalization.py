from decimal import Decimal

from app.extraction.normalization import (
    extract_numeric_values,
    identify_reporting_period,
    normalize_date,
    normalize_currency,
    normalize_table_rows,
    normalize_unit,
    validate_range,
)


def test_numeric_extraction_preserves_printed_value():
    values = extract_numeric_values("Electricity use: 1,250.5 kWh and 12% renewable")
    assert [(item.value, item.original) for item in values] == [
        (Decimal("1250.5"), "1,250.5"), (Decimal("12"), "12%")
    ]


def test_units_normalize_without_magnitude_conversion():
    unit = normalize_unit("megawatt hour")
    assert unit is not None
    assert (unit.canonical, unit.multiplier_to_canonical) == ("MWh", Decimal("1"))
    assert normalize_unit("unrecognized") is None


def test_period_detection_prefers_explicit_mentions():
    assert identify_reporting_period("For FY 2024-25, water use rose in March 2025") == ("FY 2024-25", "March 2025")


def test_iso_dates_only():
    assert str(normalize_date("2025-03-31")) == "2025-03-31"
    assert normalize_date("03/04/2025") is None


def test_ragged_table_rows_keep_headers_and_cells():
    assert normalize_table_rows([["Metric", "Value"], ["Water", "12", "extra"]]) == [{"Metric": "Water", "Value": "12"}]


def test_currency_and_range_validation_do_not_infer_conversion():
    assert normalize_currency("Revenue: ₹1,250.00") == (Decimal("1250.00"), "INR")
    assert normalize_currency("Revenue: 1250") is None
    assert validate_range(Decimal("101"), maximum=Decimal("100")) == (False, "Value is above configured maximum 100")
