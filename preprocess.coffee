fs = require 'fs'
path = require 'path'
url = "https://api.github.com/graphql"
token = process.env.PAT_TOKEN

headers =
  Authorization: "Bearer #{token}"
  'Content-Type': 'application/json'

query = """
{
  organization(login: "fortress-of-the-fallen") {
    projectV2(number: 1) {
      title
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue {
              title
              url
              number
              state
              author {
                login
                url
                avatarUrl
              }
            }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldIterationValue {
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
                duration
                startDate
              }
            }
          }
        }
      }
    }
  }
}
"""

groupBySprint = (data) ->
  grouped = {}

  for item in data
    return unless item.sprint?.startDate

    date = item.sprint.startDate
    grouped[date] = [] unless grouped[date]?
    grouped[date].push item

  grouped

saveJsonToFile = (filename, data) ->
  folder = "Sprints/Data"
  fs.mkdirSync folder, { recursive: true }
  fullPath = path.resolve folder, filename
  json = JSON.stringify data, null, 2
  fs.writeFileSync fullPath, json, 'utf-8'

fetchProject = ->
  try
    fetch(url,
      method: 'POST'
      headers: headers
      body: JSON.stringify query: query
    ).then (response) ->
      if response.ok
        response.json().then (data) ->
          data = data.data.organization.projectV2.items.nodes

          data.map (item) ->
            iter = item.fieldValues.nodes.find (x) -> x?.field?.name is "Iteration"
            item.sprint =
              duration: iter?.duration
              startDate: iter?.startDate
            delete item.fieldValues
            item

          grouped = groupBySprint(data)

          for entry in Object.entries(grouped)
            date = entry[0]
            items = entry[1]
            filename = "sprint-#{date}.json"
            saveJsonToFile filename, items
          console.log "Project data saved successfully."
          return data
      else
        console.error "Failed to fetch project:", response.statusText
  catch error
    console.error "Error fetching project:", error

readSprintFiles = ->
  folder = path.resolve __dirname, 'Sprints/Data'
  try
    files = fs.readdirSync folder
    files = files.filter (file) -> file.endsWith('.json') && file != 'index.json'
    saveJsonToFile 'index.json', files
  catch 

fetchProject()
readSprintFiles()