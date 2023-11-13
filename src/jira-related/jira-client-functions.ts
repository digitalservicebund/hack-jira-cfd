export interface JiraQueryDataForFetchingIssues {
    jiraApiBaseUrl: string,
    jiraAuthEmail: string,
    jiraAuthToken: string,
    jiraJqlQuery: string
}

export async function runJqlQueryAgainstJira(
    jiraJqlQuery: string,
    jiraApiBaseUrl: string,
    jiraAuthHeaderValue: string): Promise<object> {
    const searchParams = new URLSearchParams({ "jql": jiraJqlQuery })
    const searchAPI = `${jiraApiBaseUrl}/search`
    const searchUrl = `${searchAPI}?${searchParams}`

    const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            'Authorization': jiraAuthHeaderValue
        },
    });

    const body = await response.json();
    return body
}

export async function getIssueChangelog(
    issueKey: string,
    jiraApiBaseUrl: string,
    authHeaderValue: string): Promise<any> {
    const searchUrl = `${jiraApiBaseUrl}/issue/${issueKey}/changelog`

    const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            'Authorization': authHeaderValue
        },
    });
    return await response.json();
}