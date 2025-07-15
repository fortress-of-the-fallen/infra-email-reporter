import requests

class ApiHelper:
    @staticmethod
    def QueryGraphQL(url: str, headers:dict, query: str, variables: dict = None):
        payload = {
            "query": query,
            "variables": variables or {}
        }
      
        response = requests.post(url, json=payload, headers=headers)
        if not response.ok:
            raise RuntimeError(f"GraphQL query failed with status {response.status_code}: {response.text}")

        data = response.json()
        if "errors" in data:
            raise RuntimeError(f"GraphQL returned errors: {data['errors']}")
        
        return data.get("data", {})