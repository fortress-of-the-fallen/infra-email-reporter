from Source.Constant.ConfigKey import ConfigKey
from Source.Service.EmailService import EmailService

class EmailPipeline:
    def __init__(self, email_service:EmailService):
        self.email_service = email_service

    def run(self):
        """Runs the email pipeline."""
        for recipient in ConfigKey.EMAIL_RECIPIENTS:
            self.email_service.send_meeting_email(recipient, "Upcoming Meeting Reminder")
    