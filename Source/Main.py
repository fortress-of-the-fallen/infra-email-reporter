from Source.Configuration.LoggingConfiguration import LoggingConfiguration
from Source.WorkPinelines.WorkPinelineManager import WorkPipelineManager

if __name__ == "__main__":
    LoggingConfiguration.setup()
    
    work_pipeline_manager = WorkPipelineManager()
    work_pipeline_manager.run_all_pipelines() 

    LoggingConfiguration.SaveLogsIndex()