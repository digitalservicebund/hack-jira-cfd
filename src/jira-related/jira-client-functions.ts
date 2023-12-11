import { Issue, IssueWithChangelogs } from "../core/core-interfaces";

export interface JiraQueryDataForFetchingIssues {
    jiraApiBaseUrl: string,
    jiraAuthEmail: string,
    jiraAuthToken: string,
    jiraJqlQueryCycleTimes: string,
    jiraJqlQueryCfd: string,
    todoStateString: string,
    inProgressStateString: string
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function getChangelogsForIssues(
    issues: Issue[],
    jiraApiBaseUrl: string,
    authHeaderValue: string
): Promise<IssueWithChangelogs[]> {
    const issuesWithChangelogs = await Promise.all(
        issues.map(async issue => {
            const changelog = await getIssueChangelog(
                issue.key,
                jiraApiBaseUrl,
                authHeaderValue)

            return <IssueWithChangelogs>{
                issue,
                changelog
            }
        })
    )
    return issuesWithChangelogs
}