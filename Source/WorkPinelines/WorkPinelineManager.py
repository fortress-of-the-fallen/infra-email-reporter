import logging
from Source.WorkPinelines.EmailPineline import EmailPipeline
from Source.Service.EmailService import EmailService
from Source.WorkPinelines.SprintItemReportPineline import SprintItemReportPipeline

class WorkPipelineManager:
    def __init__(self):
        self.work_pipelines = [
            EmailPipeline(EmailService()),
            SprintItemReportPipeline()
        ]
    
    def run_all_pipelines(self):
        """Runs all work pipelines managed by this manager."""
        for pipeline in self.work_pipelines:
            logging.info(f"Running work pipeline: {pipeline}")
            try:
                pipeline.run()
            except Exception as e:
                logging.error(f"Error occurred while running pipeline {pipeline}: {e}")
            logging.info(f"Completed work pipeline: {pipeline}")