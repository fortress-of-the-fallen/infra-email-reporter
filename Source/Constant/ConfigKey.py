import os

from Source.Helper.FileHelper import FileHelper

class ConfigKey:
    # Private variables
    _settings = FileHelper.read_json_file("settings.json")
    
    # Environment variables for SMTP configuration
    SMTP_HOST = os.environ.get("SMTP_HOST")
    SMTP_PORT = os.environ.get("SMTP_PORT")
    SMTP_USER = os.environ.get("SMTP_USER")
    SMTP_PASS = os.environ.get("SMTP_PASS")
    
    # SMTP
    EMAIL_RECIPIENTS = _settings.get("email_recipients", [])
