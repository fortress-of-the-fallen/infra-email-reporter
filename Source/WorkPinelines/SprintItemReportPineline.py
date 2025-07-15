from Source.Service.SprintItemService import SprintItemService

class SprintItemReportPipeline:
    def __init__(self):
        self.sprint_item_service = SprintItemService()

    def run(self):
        self.sprint_item_service.ParseSprintItems()