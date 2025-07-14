from Source.WorkPinelines.EmailPineline import EmailPipeline
from Source.Service.EmailService import EmailService

class WorkPipelineManager:
    def __init__(self):
        self.work_pipelines = [
            EmailPipeline(EmailService()),
        ]
    
    def run_all_pipelines(self):
        """Runs all work pipelines managed by this manager."""
        for pipeline in self.work_pipelines:
            print(f"Running work pipeline: {pipeline}")
            pipeline.run()
            print(f"Completed work pipeline: {pipeline}")