import json

class FileHelper:
    @staticmethod
    def ReadJsonFile(file_path):
        """Read the content of a JSON file."""
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
        
    @staticmethod
    def ReadFile(file_path):
        """Read the content of a text file."""
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
        
    @staticmethod
    def WriteFile(file_path, content):
        """Write content to a text file."""
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(content)