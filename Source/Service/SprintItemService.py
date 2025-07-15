from datetime import datetime
import json
import logging
from Source.Constant.ConfigKey import ConfigKey
from Source.Helper.ApiHelper import ApiHelper
from Source.Helper.FileHelper import FileHelper
import requests
import os
import asyncio

class SprintItemService:    
    def GetSummaryAnalysisByGemini(self):
        prompt = f"{ConfigKey.SPRINT_SUMMARY_PROMPT}\n\n{FileHelper.ReadJsonFile(f"{ConfigKey.SPRINT_DATA_DIR}/{ConfigKey.SPRINT_ITEMS_INDEX[-1]}")}"
        
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

        logging.info(f"Response status code: {response.status_code}")

        content = response.json()['candidates'][0]['content']['parts'][0]['text']

        FileHelper.WriteFile(f"{ConfigKey.SPRINT_DATA_DIR}/{ConfigKey.SPRINT_ITEMS_INDEX[-1].split('json')[0]}.md", content)

        return content
    
    def ParseSprintItems(self):
        url = ConfigKey.GITHUB_API_URL
    
        headers = {
            "Authorization": f"Bearer {ConfigKey.GITHUB_PAT_TOKEN}",
            "Content-Type": "application/json"
        }
        
        query = FileHelper.ReadFile("Source/Static/GithubSprintItemsQuery.txt")
        
        result = ApiHelper.QueryGraphQL(url, headers, query)
        
        data = result["organization"]["projectV2"]["items"]["nodes"]
        sprint_list = []

        for item in data:
            fields = item["fieldValues"]["nodes"]
            sprint = next((f for f in fields if f.get("field", {}).get("name") == "Iteration"), None)
            if sprint:
                del sprint["field"]
                item["sprint"] = sprint
                if(sprint["startDate"] not in sprint_list): sprint_list.append(sprint["startDate"])

            del item["fieldValues"]
        
        filtered = []

        for d in sprint_list:
            date_obj = datetime.strptime(d, "%Y-%m-%d").date()
            today = datetime.today().date()
            delta = (today - date_obj).days
            if 0 <= delta <= 14 and date_obj < today:
                filtered.append(d)
        filtered.sort()
        sprint_list = filtered
        
        sprint_index = FileHelper.ReadJsonFile(f"{ConfigKey.SPRINT_DATA_DIR}/index.json")
        
        if sprint_index is None or len(sprint_list) == 0:
            FileHelper.WriteFile(f"{ConfigKey.SPRINT_DATA_DIR}/index.json", json.dumps(sprint_list, indent=4, ensure_ascii=False))
        elif sprint_list[0] not in sprint_index:
            sprint_list.append(sprint_list[0])
            FileHelper.WriteFile(f"{ConfigKey.SPRINT_DATA_DIR}/index.json", json.dumps(sprint_list, indent=4, ensure_ascii=False))
            logging.info(f"New sprint {sprint_list[0]} added to index.json")
        
        data = list(filter(lambda x: x.get("sprint", {}).get("startDate") == sprint_list[0], data))
        
        FileHelper.WriteFile(f"{ConfigKey.SPRINT_DATA_DIR}/sprint-{sprint_list[0]}.json", json.dumps(data, indent=4, ensure_ascii=False))
        logging.info(f"Filtered sprint data written to sprint-{sprint_list[0]}.json")
        
if __name__ == "__main__":
    async def main():
        SprintItemService().ParseSprintItems()

    asyncio.run(main())