import json

class FileHelper:
    @staticmethod
    def read_json_file(file_path):
        """Read the content of a JSON file."""
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)