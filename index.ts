import { JiraData, runJqlQueryAgainstJira } from "./src/jiraClient/jira-client-functions";

console.log("Started");

const hardcodedJiraData: JiraData = {
    jiraApiBaseUrl: process.env.JIRA_API_BASE_URL!,
    jiraEmail: process.env.ATLASSIAN_USER_EMAIL!,
    jiraAuthToken: process.env.ATLASSIAN_API_TOKEN!,
    jiraJqlQuery: "project = NDISC AND status = Done AND created >= -30d order by created DESC"
}

// ensureDataIsComplete() // missing #thisIsAHack
listHardcodedData(hardcodedJiraData)
const body = await runJqlQueryAgainstJira(hardcodedJiraData)
// check if we reached the limit of 50 results // missing #thisIsAHack

console.log(body);

// -----------
function listHardcodedData(jiraData: JiraData): void {
    console.log("jiraEmail:", jiraData.jiraEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQuery:", `"${jiraData.jiraJqlQuery}"`);
}

interface Issue {
    key: string
}

export function mapJiraResponseToBusinessObjects(jiraResponse: object): Issue[] {
    return []
}

