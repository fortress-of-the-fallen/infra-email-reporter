# 🏰 Fortress of the Fallen - Infra Email Reporter

Hệ thống infrastructure tự động cho team [Fortress of the Fallen](https://github.com/fortress-of-the-fallen), bao gồm email reporter và sprint management dashboard.

## 🌟 Tổng quan

Dự án này cung cấp 2 tính năng chính:
1. **📧 Email Reporter**: Tự động gửi email nhắc nhở cuộc họp
2. **📊 Sprint Dashboard**: Giao diện quản lý sprint với thiết kế glassmorphism

## ✨ Tính năng

### 📧 Email Reporter
- 🔄 **Pipeline tự động**: Quản lý quy trình gửi email qua WorkPipelineManager
- 📨 **Email HTML đẹp mắt**: Template responsive với thiết kế Google Meet
- ⚙️ **Cấu hình linh hoạt**: Sử dụng biến môi trường và file settings.json
- 📋 **Danh sách người nhận**: Quản lý qua file cấu hình JSON
- ⏰ **CI/CD tự động**: Chạy hàng ngày qua GitHub Actions

### 📊 Sprint Dashboard
- 🎨 **Thiết kế Glassmorphism**: Giao diện hiện đại với hiệu ứng kính mờ
- 📱 **Responsive Design**: Tương thích mọi thiết bị
- 📈 **Thống kê chi tiết**: 
  - Tổng số tickets, tickets hoàn thành, đang làm
  - Tỷ lệ hoàn thành theo %
  - Breakdown theo repository và contributor
  - Progress bars trực quan
- 👤 **Avatar GitHub**: Hiển thị ảnh đại diện của contributors
- 🔗 **Integration GitHub**: Click vào ticket để mở GitHub issue
- 📊 **Project Board**: Kết nối với [GitHub Project](https://github.com/orgs/fortress-of-the-fallen/projects/1)

## 🚀 Cài đặt & Chạy

### Cấu hình Email Reporter

1. **Cấu hình biến môi trường** (tạo file `.env`):
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TOKEN=github-token-for-graphql
```

2. **Cấu hình người nhận** (`settings.json`):
```json
{
  "email_recipients": [
    "member1@example.com",
    "member2@example.com"
  ]
}
```

3. **Chạy ứng dụng**:
```bash
python -m Source.Main
```

### Sử dụng Sprint Dashboard

1. **Fetch dữ liệu từ GitHub**:
```bash
npm install -g coffeescript
coffee preprocess.coffee
```

2. **Mở Sprint Dashboard**:
```bash
# Mở file Sprints/index.html trong trình duyệt
open Sprints/index.html
```

## 📁 Cấu trúc dự án

```
infra-email-reporter/
├── 📧 Email Reporter
│   ├── Source/
│   │   ├── Main.py                    # Entry point
│   │   ├── WorkPinelines/             # Quản lý pipeline
│   │   │   ├── WorkPinelineManager.py # Manager chính
│   │   │   └── EmailPineline.py       # Pipeline gửi email
│   │   ├── Service/
│   │   │   ├── EmailService.py        # Service xử lý SMTP
│   │   │   └── SprintItemService.py   # Service sprint items
│   │   ├── Static/
│   │   │   └── meeting-reminder.html  # Template email
│   │   ├── Constant/
│   │   │   └── ConfigKey.py          # Cấu hình hệ thống
│   │   └── Helper/
│   │       └── FileHelper.py         # Tiện ích đọc file
│   └── settings.json                 # Cấu hình người nhận
├── 📊 Sprint Dashboard
│   ├── Sprints/
│   │   ├── index.html                # Dashboard chính
│   │   └── Data/                     # Dữ liệu sprint
│   │       ├── index.json           # Danh sách sprint files
│   │       ├── sprint-2025-07-07.json
│   │       └── sprint-2025-07-21.json
│   └── preprocess.coffee            # Script fetch data từ GitHub
├── 🚀 CI/CD
│   └── .github/workflows/
│       └── pineline.yaml            # GitHub Actions
└── 📚 Documentation
    ├── docs/                        # Hình ảnh documentation
    └── readme.md                    # File này
```

## 🔄 CI/CD Pipeline

Dự án được tự động hóa qua GitHub Actions:

- **⏰ Lịch chạy**: Mỗi ngày lúc 3:00 GMT (10:00 GMT+7)
- **🚀 Manual trigger**: Có thể chạy thủ công qua GitHub Actions
- **📧 Tự động gửi email**: Nhắc nhở cuộc họp team hàng ngày

## 🛠️ Công nghệ sử dụng

### Backend (Email Reporter)
- **Python 3.11+** - Ngôn ngữ chính
- **smtplib** - Gửi email qua SMTP
- **HTML Email Template** - Giao diện email đẹp mắt
- **GitHub Actions** - CI/CD tự động

### Frontend (Sprint Dashboard)
- **HTML5/CSS3/JavaScript** - Core technologies
- **Glassmorphism Design** - Thiết kế hiện đại
- **GitHub GraphQL API** - Fetch dữ liệu project
- **CoffeeScript** - Script preprocessing
- **Responsive Design** - Mobile-friendly

### Integration
- **GitHub Projects V2** - Quản lý sprint
- **GitHub Issues** - Ticket tracking
- **GitHub API** - Data fetching

## 📊 Sprint Data Structure

```json
{
  "id": "PVTI_...",
  "content": {
    "title": "Feature Title",
    "url": "https://github.com/fortress-of-the-fallen/repo/issues/1",
    "number": 1,
    "state": "OPEN|CLOSED",
    "author": {
      "login": "username",
      "url": "https://github.com/username",
      "avatarUrl": "https://avatars.githubusercontent.com/..."
    }
  },
  "sprint": {
    "duration": 14,
    "startDate": "2025-07-21"
  }
}
```

## 🔗 Links quan trọng

- 🏢 **Organization**: [Fortress of the Fallen](https://github.com/fortress-of-the-fallen)
- 📋 **Project Board**: [GitHub Project](https://github.com/orgs/fortress-of-the-fallen/projects/1)
- 🎮 **Game Design**: [FotF-GDD](https://github.com/fortress-of-the-fallen/FotF-GDD)
- ⚙️ **Backend**: [Back-end](https://github.com/fortress-of-the-fallen/back-end)
- 🎨 **Client**: [FotF-Client](https://github.com/fortress-of-the-fallen/FotF-Client)

## 👥 Team

- **wwenrr** - Backend Developer
- **TKira4** - Game Designer & Developer

---

*🏰 Được phát triển bởi Fortress of the Fallen Team*

**"Building the future of gaming, one sprint at a time"**