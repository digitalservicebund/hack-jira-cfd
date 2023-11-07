console.log("Started");

interface JiraData {
    jiraApiBaseUrl: string,
    jiraEmail: string,
    jiraAuthToken: string,
    jiraJqlQuery: string
}

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

async function runJqlQueryAgainstJira(jiraData: JiraData): Promise<object> {
    const searchParams = new URLSearchParams({ "jql": jiraData.jiraJqlQuery })
    const searchAPI = `${jiraData.jiraApiBaseUrl}/search`
    const searchUrl = `${searchAPI}?${searchParams}`
    console.log(searchUrl);

    const base64Credentials = btoa(`${jiraData.jiraEmail}:${jiraData.jiraAuthToken}`)
    const authHeaderValue = `Basic ${base64Credentials}`

    const response = await fetch(searchUrl, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json", 
            'Authorization': authHeaderValue
        },
    });

    const body = await response.json();
    return body
}