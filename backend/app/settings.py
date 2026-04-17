import os


NEWS_API_KEY = os.getenv("NEWS_API_KEY", "").strip()
NEWS_API_BASE_URL = os.getenv("NEWS_API_BASE_URL", "https://newsapi.org/v2").strip()
NEWS_API_LANGUAGE = os.getenv("NEWS_API_LANGUAGE", "en").strip()
NEWS_API_PAGE_SIZE = max(1, min(int(os.getenv("NEWS_API_PAGE_SIZE", "8")), 20))
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "").strip()
ALPHA_VANTAGE_API_BASE_URL = os.getenv("ALPHA_VANTAGE_API_BASE_URL", "https://www.alphavantage.co/query").strip()
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "").strip()
TWELVE_DATA_API_BASE_URL = os.getenv("TWELVE_DATA_API_BASE_URL", "https://api.twelvedata.com").strip()
