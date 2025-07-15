import os

from Source.Helper.FileHelper import FileHelper

class ConfigKey:
    # Private variables
    _settings = FileHelper.ReadJsonFile("settings.json")
    
    # Environment variables for SMTP configuration
    SMTP_HOST = os.environ.get("SMTP_HOST")
    SMTP_PORT = os.environ.get("SMTP_PORT")
    SMTP_USER = os.environ.get("SMTP_USER")
    SMTP_PASS = os.environ.get("SMTP_PASS")
    
    # SMTP
    EMAIL_RECIPIENTS = _settings.get("email_recipients", [])
    
    # Sprint Items
    GITHUB_API_URL = "https://api.github.com/graphql"
    GITHUB_PAT_TOKEN = os.environ.get("PAT_TOKEN")
    SPRINT_DATA_DIR = "Sprints/Data"
    SPRINT_ITEMS_INDEX = FileHelper.ReadJsonFile("Sprints/Data/index.json")
    SPRINT_SUMMARY_PROMPT = FileHelper.ReadFile("Source/Static/SprintSummaryPrompt.txt")
