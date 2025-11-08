from pydantic import BaseModel
from typing import List, Optional


class OnboardingData(BaseModel):
    business_type: str
    products_of_interest: List[str]
    challenges: List[str]
    goals: List[str]
    display_mode: Optional[str] = "charts"  # charts/text/table
    language: Optional[str] = "en"  # sw/en
