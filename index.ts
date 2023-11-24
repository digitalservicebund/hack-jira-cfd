import { JiraQueryDataForFetchingIssues, getIssueChangelog, runJqlQueryAgainstJira } from "./src/jira-related/jira-client-functions";
import { createAuthorizationHeaderValue, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./src/jira-related/jira-service-functions";
import { createPlotDataForPercentages, createPlotDataFromCycleTimeHistogram } from "./src/plotting/plotting-functions";
import { getCycleTimeHistogram } from "./src/core/core-functions";
import { Layout, Plot, plot } from "nodeplotlib";
import { log } from "mathjs";
import { stat } from "fs";

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
console.log(`Found ${issues.length} issues`);

console.log("Fetching details on items: ");

const statsIncludingUndefinedStarts = await Promise.all(
    issues.map(async issue => {
        const issueChangelog = await getIssueChangelog(
            issue.key,
            hardcodedJiraData.jiraApiBaseUrl,
            authHeaderValue)
        const startedDate = getDateForStartingInProgressOfIssue(issueChangelog)
        const startedDateInfo = startedDate ? startedDate.toISOString() : "not found"
        console.log("- ${issue.key}: "
            + startedDateInfo
            + " till "
            + issue.resolutionDate.toISOString())
        return {
            ...issue,
            startedDate
        }
    })
)

const stats = statsIncludingUndefinedStarts.filter(e => e.startedDate !== undefined)

console.log("Computing graph data");

const cycleTimeHistogramData = getCycleTimeHistogram(stats)
const histogramPlotData = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)
const percentagesPlotData = createPlotDataForPercentages(cycleTimeHistogramData)

const histogramPlot: Plot = {
    ...histogramPlotData,
    type: "bar"
}

console.log(histogramPlot);

const percentagesPlot: Plot = {
    ...percentagesPlotData,
    type: "scatter"
}

console.log(percentagesPlot);

const cfdPlot: Plot = {
    x: [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")],
    y: [1, 2, 3],
    name: "To Do",
    type: "bar"
}
const cfdPlot2: Plot = {
    x: [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")],
    y: [2, 3, 4],
    name: "In Progress",
    type: "bar"
}


const histogramLayout: Layout = {
    title: `Cycle Time Histogram (In Progress -> Done)<br>(${process.env.JIRA_JQL_QUERY})`,
    xaxis: {
        title: `Working days until completion`
    },
    yaxis: {
        title: "# of issues"
    }
}

const percentagesLayout: Layout = {
    title: "Cycle Time Percentages",
    xaxis: {
        title: "Completed within x working days"
    },
    yaxis: {
        title: `% of issues completed (total: ${issues.length}) `,
        range: [0, 100]
    }
}

const cfdLayout: Layout = {
    barmode: "stack",
    title: "Made up CFD (placeholder)"
}

plot([histogramPlot], histogramLayout)
plot([percentagesPlot], percentagesLayout)
plot([cfdPlot, cfdPlot2], cfdLayout)


console.log("Done");

// -----------
function listHardcodedData(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQuery:", `"${jiraData.jiraJqlQuery}"`);
}

