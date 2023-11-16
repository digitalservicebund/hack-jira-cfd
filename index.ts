import { JsxEmit } from "typescript";
import { JiraQueryDataForFetchingIssues, getIssueChangelog, runJqlQueryAgainstJira } from "./src/jira-related/jira-client-functions";
import { createAuthorizationHeaderValue, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./src/jira-related/jira-service-functions";
import { createPlotDataForLikelyhoods, createPlotDataFromCycleTimeHistogram, plotCycleTimeHistogram } from "./src/plotting/plotting-functions";
import { CycleTimeHistogramEntry, getCycleTimeHistogram } from "./src/core/core-functions";
import { Plot, plot } from "nodeplotlib";

console.log("Started");

const hardcodedJiraData: JiraQueryDataForFetchingIssues = {
    jiraApiBaseUrl: process.env.JIRA_API_BASE_URL!,
    jiraAuthEmail: process.env.ATLASSIAN_USER_EMAIL!,
    jiraAuthToken: process.env.ATLASSIAN_API_TOKEN!,
    jiraJqlQuery: "project = NDISC AND status = Done AND created >= -30d order by created DESC"
}

// ensureDataIsComplete() // missing #thisIsAHack
listHardcodedData(hardcodedJiraData)

const authHeaderValue = createAuthorizationHeaderValue(hardcodedJiraData.jiraAuthEmail, hardcodedJiraData.jiraAuthToken);
const jqlResult = await runJqlQueryAgainstJira(hardcodedJiraData.jiraJqlQuery, hardcodedJiraData.jiraApiBaseUrl, authHeaderValue)
const issues = mapJiraResponseToBusinessObjects(jqlResult)
// check if we reached the limit of 50 results // missing #thisIsAHack
const stats = await Promise.all(
    issues.map(async issue => {
        const issueChangelog = await getIssueChangelog(
            issue.key,
            hardcodedJiraData.jiraApiBaseUrl,
            authHeaderValue)
        const startedDate = getDateForStartingInProgressOfIssue(issueChangelog)
        console.log(`fetching details on ${issue.key}`)
        return {
            ...issue,
            startedDate
        }
    })
)

const cycleTimeHistogramData = getCycleTimeHistogram(stats)

const histogramPlot = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)
const likelyhoodPlot = createPlotDataForLikelyhoods(cycleTimeHistogramData)

const data: Plot[] = [
    histogramPlot,
    likelyhoodPlot
]

(data);


console.log("Done");

// -----------
function listHardcodedData(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQuery:", `"${jiraData.jiraJqlQuery}"`);
}

