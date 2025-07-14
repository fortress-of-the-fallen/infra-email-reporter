import os
import smtplib
from email.mime.text import MIMEText

# Lấy thông tin từ biến môi trường
smtp_host = os.environ.get('SMTP_HOST')
smtp_port = int(os.environ.get('SMTP_PORT', 587))
smtp_user = os.environ.get('SMTP_USER')
smtp_pass = os.environ.get('SMTP_PASS')

# Tạo nội dung email
msg = MIMEText("Nội dung email")
msg['Subject'] = "Tiêu đề email"
msg['From'] = smtp_user
msg['To'] = "toan.haoz@hcmut.edu.vn" 

print(f"[DEBUG] SMTP Host: {smtp_host}, Port: {smtp_port}")
with smtplib.SMTP(smtp_host, smtp_port) as server:
    server.starttls()
    server.login(smtp_user, smtp_pass)
    server.send_message(msg)