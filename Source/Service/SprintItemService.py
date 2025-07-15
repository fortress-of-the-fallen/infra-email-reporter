from Source.Constant.ConfigKey import ConfigKey
from Source.Helper.FileHelper import FileHelper
import requests
import os
import asyncio

class SprintItemService:
    _lastSprintItems = FileHelper.ReadJsonFile(f"{ConfigKey.SPRINT_DATA_DIR}/{ConfigKey.SPRINT_ITEMS_INDEX[-1]}")
    
    def GetSummaryAnalysisByGemini(self):
        prompt = f"{ConfigKey.SPRINT_SUMMARY_PROMPT}\n\n{self._lastSprintItems}"
        
        body = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }
        
        response = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={os.getenv('GEMINI_API_KEY')}", json=body)

        content = response.json()['candidates'][0]['content']['parts'][0]['text']

        FileHelper.WriteFile(f"{ConfigKey.SPRINT_DATA_DIR}/{ConfigKey.SPRINT_ITEMS_INDEX[-1].split('json')[0]}.md", content)

        return content

if __name__ == "__main__":
    async def main():
        service = SprintItemService()
        summary = service.GetSummaryAnalysisByGemini()
        print(summary)

    asyncio.run(main())