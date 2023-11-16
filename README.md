# hack-jira-cfd
Get more info about the flow of work in a Jira project.

![Two graphs. One showing a histogram of cycle times, the other showing the percentage of issues completed after x days](https://github.com/digitalservicebund/hack-jira-cfd/blob/main/res/screenshot.png)

## Configure via Environment Variables
We need a couple of environment variables set. You can use a `.env` file to do so.
* `ATLASSIAN_USER_EMAIL` - The email of the account to authenticate with
* `ATLASSIAN_API_TOKEN` - An API token of the account to authenticate with (here's how to create: [Atlassian docs](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/))
* `JIRA_API_BASE_URL` - The base URL of the Jira instance you want to talk to (e.g. `https://<myCompany>.atlassian.net/rest/api/2`)
* `JIRA_JQL_QUERY` - The query to fetch issues to report on (e.g. `project = MYPROJ AND status = Done AND created >= -30d order by created DESC`)
## Run the App
* Fetch dependencies: `bun install`
* Run once: `bun index.ts`
* Run in watch mode: `bun --watch index.ts`

## Test
* Run tests once: `bun test`
* Run in watch mode: `bun --watch test`