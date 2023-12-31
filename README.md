![GitHub Actions CI Status](https://github.com/digitalservicebund/hack-jira-cfd/actions/workflows/bun.yml/badge.svg)

# hack-jira-cfd
Get more info about the flow of work in a Jira Cloud project.

![Three graphs. The first one showing a histogram of tickets' cycle times. The second one showing the percentage of issues completed after x days. The third showing the Cumulative Flow Diagram with gaps for Saturdays and Sundays, the mouse pointing to Nov 9 2023 revealing the counts for "To Do" (5), "In Progress" (6) and "Resolved" (26)](https://github.com/digitalservicebund/hack-jira-cfd/blob/main/res/screenshot.png)

# Features and Known Non-Features

✅ Fetch a collection of issues based on some JQL (filter) query<br>
❌ Handle limitations on the number of issues (check for pagination or similar) <br>
✅ Authentication configured via environment variables (or `.env`)<br>
✅ Query configured via env vars as well <br>
✅ Fetch changelog of issues <br>
✅ Determine date of issue going into "In Progress"<br>
✅ "In Progress" state configured via env vars (currently hard coded as "In Progress")<br>
❌ Deal with issues that were moved in and out of "In Progress" multiple times <br>
✅ Calculate data for a cycle time histogram (# of days between going into "In Progress" and the issue's `resolutionDate`) <br>
✅ Ignore issues that never went into "In Progress"
✅ Display the histogram, show the user <br>
✅ Calculate data for a cycle time graph showing what percentage of all issues was completed in what period of time <br>
✅ Display the cycle time percentages graph <br>
✅ Calculate data for a Cumulative Flow Diagram (CFD) <br>
✅ Display a Cumulative Flow Diagram <br>
✅ Configure states for CFD via env vars <br>
✅ Remove weekends from CFD

# Running / Dev

## Configuring via Environment Variables
We need a couple of environment variables set. You can use a `.env` file to do so.

Auth / API:
* `ATLASSIAN_USER_EMAIL` - The email of the account to authenticate with
* `ATLASSIAN_API_TOKEN` - An API token of the account to authenticate with (here's how to create: [Atlassian docs](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/))
* `JIRA_API_BASE_URL` - The base URL of the Jira instance you want to talk to (e.g. `https://<myCompany>.atlassian.net/rest/api/2`)

Queries:
* `JIRA_JQL_QUERY_CYCLE_TIMES` - The query to fetch issues to report cycle times on (e.g. `project = MYPROJ AND status = Done AND created >= -30d`)
* `JIRA_JQL_QUERY_CFD` - The query to fetch issues to run the Cumulative Flow Diagram (CFD) on (e.g. `project = MYPROJ`)

States:
* `TODO_STATE_STRING` - The state that depicts "To Do" (e.g. `To Do`)
* `IN_PROGRESS_STATE_STRING`- The state that depicts "In Progress" (e.g. `In Progress`)

## Running the App
* Fetch dependencies: `bun install`
* Run once: `bun index.ts`
* Run in watch mode: `bun --watch index.ts`

## Testing
* Run tests once: `bun test`
* Run in watch mode: `bun --watch test`

# Contributing
Cf. [`Contributing.md`](./Contributing.md)
