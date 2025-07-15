import json
import logging
import os
from datetime import datetime
import shutil

class LoggingConfiguration:
    LOGGING_LEVEL = logging.INFO
    LOGGING_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOGGING_DATEFMT = "%Y-%m-%d %H:%M:%S"

    @staticmethod
    def setup():
        # Tạo thư mục Log nếu chưa tồn tại
        log_dir = "Log"
        os.makedirs(log_dir, exist_ok=True)

        # Tạo đường dẫn file log theo ngày hiện tại
        log_filename = datetime.now().strftime("%d-%m-%Y") + ".log"
        log_path = os.path.join(log_dir, log_filename)

        # Cấu hình logging
        logging.basicConfig(
            level=LoggingConfiguration.LOGGING_LEVEL,
            format=LoggingConfiguration.LOGGING_FORMAT,
            datefmt=LoggingConfiguration.LOGGING_DATEFMT,
            handlers=[
                logging.FileHandler(log_path, encoding="utf-8"),
                logging.StreamHandler()
            ]
        )

    @staticmethod
    def SaveLogsIndex():
        log_dir="Log"
        output_file="Log/index.json"
        # Đảm bảo thư mục log tồn tại
        if not os.path.exists(log_dir):
            print(f"Thư mục {log_dir} không tồn tại.")
            return

        # Lấy danh sách file .log (chỉ tên file)
        log_files = [f for f in os.listdir(log_dir) if f.endswith(".log")]

        log_files.sort()

        # Ghi ra file index.json chỉ chứa tên file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(log_files, f, indent=2, ensure_ascii=False)

        target_dir = os.path.join("Sprints", "Log")
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir) 
        shutil.copytree("Log", target_dir)
