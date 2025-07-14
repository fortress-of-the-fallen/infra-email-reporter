from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from Source.Constant.ConfigKey import ConfigKey
from datetime import datetime, time

class EmailService:
    def __init__(self):
        self.smtp_host = ConfigKey.SMTP_HOST
        self.smtp_port = ConfigKey.SMTP_PORT
        self.smtp_user = ConfigKey.SMTP_USER
        self.smtp_pass = ConfigKey.SMTP_PASS

    def send_meeting_email(self, to, subject):
        with open("Source/Static/meeting-reminder.html", "r", encoding="utf-8") as f:
            html_template = f.read()
            
        now = datetime.now()
        meeting_start = datetime.combine(now.date(), time(hour=9, minute=0))

        body = html_template.format(
            date=meeting_start.strftime("%A, %B %d, %Y"), 
            time=meeting_start.strftime("%I:%M %p (GMT+7)"), 
            duration="15 minutes",
            meeting_url="https://meet.google.com/tke-ynxc-rxx",
        )

        msg = MIMEMultipart("alternative")
        msg['Subject'] = subject
        msg['From'] = self.smtp_user
        msg['To'] = to
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
