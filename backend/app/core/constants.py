"""Common constants shared across the backend.

Business constants (scheme categories, scoring weights, etc.) will be added
here as those features land.
"""

# English only today. The AI edge (app/ai) and its request schemas both read
# this registry rather than hardcoding "English" — adding Hindi or Odia later
# is a new entry here plus new prompt phrasing, not a redesign.
SUPPORTED_LANGUAGES = {"en": "English"}
