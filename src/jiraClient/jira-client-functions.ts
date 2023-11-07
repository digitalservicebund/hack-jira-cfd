export interface JiraData {
    jiraApiBaseUrl: string,
    jiraEmail: string,
    jiraAuthToken: string,
    jiraJqlQuery: string
}

export async function runJqlQueryAgainstJira(jiraData: JiraData): Promise<object> {
    const searchParams = new URLSearchParams({ "jql": jiraData.jiraJqlQuery })
    const searchAPI = `${jiraData.jiraApiBaseUrl}/search`
    const searchUrl = `${searchAPI}?${searchParams}`

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