# hack-jira-cfd
Get more info about the flow of work in a Jira project.

## How to Configure Authentication via Environment Variables
* Export your email address as `ATLASSIAN_USER_EMAIL` or use an `.env` file to set it
* Create an API token: [Atlassian docs](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
    *  Export as `ATLASSIAN_API_TOKEN` or use a `.env` file to set it
## How to Run the App
* Fetch dependencies: `bun install`
* Run once: `bun index.ts`
* Run in watch mode: `bun --watch index.ts`