# 🏰 Fortress of the Fallen - Infra Email Reporter

Một hệ thống tự động hóa quản lý sprint và báo cáo cho dự án **Fortress of the Fallen**. Ứng dụng kết hợp automation email, phân tích dữ liệu sprint và dashboard trực quan để tối ưu hóa quy trình làm việc của team.

## ✨ Tính năng chính

### 📧 **Email Automation**
- **Meeting Reminder**: Gửi email nhắc nhở meeting tự động
- **SMTP Integration**: Hỗ trợ gửi email qua SMTP server
- **HTML Templates**: Email được thiết kế đẹp mắt với template HTML
- **Scheduled Notifications**: Tự động gửi theo lịch trình

### 📊 **Sprint Management & Analytics**
- **Sprint Data Crawler**: Thu thập dữ liệu sprint từ GitHub Projects
- **AI-Powered Analysis**: Sử dụng Google Gemini AI để phân tích sprint
- **Performance Tracking**: Theo dõi hiệu suất từng contributor
- **Data Visualization**: Biểu đồ và thống kê trực quan

### 🎛️ **Interactive Dashboard**
- **Glassmorphism Design**: Giao diện hiện đại với hiệu ứng thủy tinh
- **Dark/Light Theme**: Chuyển đổi theme linh hoạt
- **Responsive Layout**: Tối ưu cho mọi thiết bị
- **Real-time Charts**: Biểu đồ tương tác với Chart.js

### 🤖 **AI Integration**
- **Gemini AI**: Phân tích thông minh nội dung sprint
- **Automated Reports**: Tự động tạo báo cáo chi tiết
- **Insight Generation**: Đưa ra nhận xét và gợi ý cải thiện

## 🏗️ Kiến trúc hệ thống

```
infra-email-reporter/
├── Source/                          # Python Backend
│   ├── WorkPinelines/              # Pipeline orchestration
│   │   ├── EmailPineline.py        # Email automation pipeline
│   │   └── WorkPinelineManager.py  # Pipeline manager
│   ├── Service/                    # Business logic services
│   │   ├── EmailService.py         # Email sending service
│   │   └── SprintItemService.py    # Sprint data processing
│   ├── Helper/                     # Utility functions
│   │   └── FileHelper.py           # File operations
│   ├── Constant/                   # Configuration
│   │   └── ConfigKey.py            # Config constants
│   ├── Static/                     # Static assets
│   │   ├── meeting-reminder.html   # Email template
│   │   └── SprintSummaryPrompt.txt # AI prompt
│   └── Main.py                     # Application entry point
├── Sprints/                        # Frontend Dashboard
│   ├── Data/                       # Sprint data storage
│   │   ├── index.json             # Sprint index
│   │   ├── sprint-*.json          # Sprint data files
│   │   └── sprint-*.md            # AI analysis reports
│   ├── index.html                 # Dashboard main page
│   ├── script.js                  # Frontend logic
│   └── style.css                  # Glassmorphism styles
├── settings.json                   # Application settings
├── req.txt                        # Python dependencies
└── run.bat                        # Windows runner script
```

## 🔧 Thiết lập môi trường

### **1. Yêu cầu hệ thống**
- Python 3.8+
- Node.js (cho development)
- SMTP server access
- Google Gemini API key

### **2. Cài đặt dependencies**
```bash
# Cài đặt Python packages
pip install -r req.txt

# Hoặc cài đặt thủ công
pip install requests smtplib email
```

### **3. Cấu hình environment variables**
```bash
# Email configuration
export SMTP_HOST="your-smtp-host"
export SMTP_PORT="587"
export SMTP_USER="your-email@domain.com"
export SMTP_PASS="your-app-password"

# AI configuration  
export GEMINI_API_KEY="your-gemini-api-key"
```

### **4. Cấu hình settings.json**
```json
{
  "email_recipients": [
    "team-member1@email.com",
    "team-member2@email.com"
  ]
}
```

## 🚀 Sử dụng

### **1. Chạy Email Pipeline**
```bash
# Chạy tất cả pipelines
python Source/Main.py

# Hoặc sử dụng batch file (Windows)
run.bat
```

### **2. Tạo Sprint Analysis**
```bash
# Chạy AI analysis cho sprint hiện tại
python Source/Service/SprintItemService.py
```

### **3. Xem Dashboard**
```bash
# Mở file trong browser
open Sprints/index.html

# Hoặc serve với Python
python -m http.server 8000
# Truy cập: http://localhost:8000/Sprints/
```

## 📈 Dashboard Features

### **Sprint Overview**
- 📊 Completion Rate Charts
- 👥 Contributor Performance
- 📁 Repository Distribution  
- 📈 Task Status Breakdown

### **Advanced Analytics**
- ⏱️ Progress Timeline
- 🔮 Sprint Prediction
- 📊 Velocity Analysis
- 🎯 Performance Metrics

### **Interactive Elements**
- 🎨 Theme Toggle (Dark/Light)
- 📱 Mobile Responsive
- 🔍 Drill-down Details
- 📋 Export Reports

## 🔗 Tích hợp

### **GitHub Integration**
- Tự động crawl sprint data từ GitHub Projects
- Sync real-time với GitHub Issues
- Link trực tiếp đến issues từ dashboard

### **CI/CD Integration**
- Setup auto-reporting via GitHub Actions
- Scheduled pipeline execution
- Automated deployment

## 🛠️ Development

### **Thêm Pipeline mới**
```python
# Tạo pipeline mới trong WorkPinelines/
class YourPipeline:
    def run(self):
        # Your logic here
        pass

# Đăng ký trong WorkPinelineManager
self.work_pipelines.append(YourPipeline())
```

### **Customize Email Template**
- Chỉnh sửa `Source/Static/meeting-reminder.html`
- Sử dụng format strings cho dynamic content
- Support HTML và inline CSS

### **Extend Dashboard**
- Thêm chart mới trong `script.js`
- Custom styles trong `style.css`
- Responsive design với CSS Grid/Flexbox

## 📝 License

Dự án này thuộc về **Fortress of the Fallen** organization.

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/fortress-of-the-fallen/infra-email-reporter/issues)
- **Organization**: [Fortress of the Fallen](https://github.com/fortress-of-the-fallen)
- **Project Board**: [Sprint Management](https://github.com/orgs/fortress-of-the-fallen/projects/1)

---

*Được xây dựng với ❤️ bởi Fortress of the Fallen team*