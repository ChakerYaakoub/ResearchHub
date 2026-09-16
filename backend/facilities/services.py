"""Facility catalog rules."""

from facilities.models import (
    InstallationStatus,
    Instrument,
    InstrumentStatus,
)


class FacilityError(Exception):
    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


def assert_instrument_selectable(instrument: Instrument) -> None:
    """New instrument selection must be AVAILABLE on an ACTIVE installation."""
    if instrument.installation.status != InstallationStatus.ACTIVE:
        raise FacilityError(
            "Selected instrument belongs to an inactive installation."
        )
    if instrument.status != InstrumentStatus.AVAILABLE:
        raise FacilityError("Selected instrument is not available.")
