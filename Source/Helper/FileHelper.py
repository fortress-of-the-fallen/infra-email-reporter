import json
import os

class FileHelper:
    @staticmethod
    def ReadJsonFile(file_path):
        """Read the content of a JSON file."""
        if not os.path.exists(file_path):
            return None
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
        
    @staticmethod
    def ReadFile(file_path):
        """Read the content of a text file."""
        if not os.path.exists(file_path):
            return None
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
        
    @staticmethod
    def WriteFile(file_path, content):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        """Write content to a text file."""
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(content)