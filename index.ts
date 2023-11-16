import { JiraQueryDataForFetchingIssues, getIssueChangelog, runJqlQueryAgainstJira } from "./src/jira-related/jira-client-functions";
import { createAuthorizationHeaderValue, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./src/jira-related/jira-service-functions";
import { createPlotDataForLikelyhoods, createPlotDataFromCycleTimeHistogram } from "./src/plotting/plotting-functions";
import { getCycleTimeHistogram } from "./src/core/core-functions";
import { Layout, Plot, plot } from "nodeplotlib";

console.log("Started");

const hardcodedJiraData: JiraQueryDataForFetchingIssues = {
    jiraApiBaseUrl: process.env.JIRA_API_BASE_URL!,
    jiraAuthEmail: process.env.ATLASSIAN_USER_EMAIL!,
    jiraAuthToken: process.env.ATLASSIAN_API_TOKEN!,
    jiraJqlQuery: process.env.JIRA_JQL_QUERY!
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

const histogramPlotData = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)
const likelyhoodPlotData = createPlotDataForLikelyhoods(cycleTimeHistogramData)


const histogramPlot: Plot = {
    ...histogramPlotData,
    type: "bar"
}

console.log(histogramPlot);

const likelyhoodPlot: Plot = {
    ...likelyhoodPlotData,
    type: "scatter"
}

console.log(likelyhoodPlot);


const histogramLayout: Layout = {
    title: "Cycle Time Histogram (In Progress -> Done)",
    xaxis: {
        title: "Days after being started"
    },
    yaxis: {
        title: "# of issues"
    }
}

const likelyHoodLayout: Layout = {
    title: "Completion Ratio",
    xaxis: {
        title: "Days after being started"
    },
    yaxis: {
        title: "% of issues completed",
        range: [0, 100]
    }
}

plot([histogramPlot], histogramLayout)
plot([likelyhoodPlot], likelyHoodLayout)


console.log("Done");

// -----------
function listHardcodedData(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQuery:", `"${jiraData.jiraJqlQuery}"`);
}

