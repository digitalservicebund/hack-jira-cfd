import { JiraQueryDataForFetchingIssues, getIssueChangelog, runJqlQueryAgainstJira } from "./src/jira-related/jira-client-functions";
import { StateWithDate, createAuthorizationHeaderValue, getAllStatesWithDates, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./src/jira-related/jira-service-functions";
import { createPlotDataForCfd, createPlotDataForPercentages, createPlotDataFromCycleTimeHistogram } from "./src/plotting/plotting-functions";
import { getCycleTimeHistogram } from "./src/core/core-functions";
import { Layout, Plot, plot } from "nodeplotlib";
import { log } from "mathjs";
import { stat } from "fs";

console.log("Started");

const hardcodedJiraData: JiraQueryDataForFetchingIssues = {
    jiraApiBaseUrl: process.env.JIRA_API_BASE_URL!,
    jiraAuthEmail: process.env.ATLASSIAN_USER_EMAIL!,
    jiraAuthToken: process.env.ATLASSIAN_API_TOKEN!,
    jiraJqlQueryCycleTimes: process.env.JIRA_JQL_QUERY_CYCLE_TIMES!,
    jiraJqlQueryCfd: process.env.JIRA_JQL_QUERY_CFD!,

}

// ensureDataIsComplete() // missing #thisIsAHack
listHardcodedData(hardcodedJiraData)

const authHeaderValue = createAuthorizationHeaderValue(hardcodedJiraData.jiraAuthEmail, hardcodedJiraData.jiraAuthToken);

// Cycle times
const jqlResultCycleTimes = await runJqlQueryAgainstJira(hardcodedJiraData.jiraJqlQueryCycleTimes, hardcodedJiraData.jiraApiBaseUrl, authHeaderValue)
const issuesCycleTimes = mapJiraResponseToBusinessObjects(jqlResultCycleTimes)
// check if we reached the limit of 50 results // missing #thisIsAHack
console.log(`Found ${issuesCycleTimes.length} issues`);

console.log("Fetching details on items: ");

// TODO: get away with the let, here
let issuesWithChangelogs: any = []

const statsIncludingUndefinedStarts = await Promise.all(
    issuesCycleTimes.map(async issue => {
        const issueChangelog = await getIssueChangelog(
            issue.key,
            hardcodedJiraData.jiraApiBaseUrl,
            authHeaderValue)

        // alien code below
        issuesWithChangelogs.push({
            issue: issue,
            issueChangelog: issueChangelog
        })
        // alien code above

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

const dateWithStatesArray: StateWithDate[][] = issuesWithChangelogs.map((iwc: any) => getAllStatesWithDates(iwc.issue, iwc.issueChangelog))
const cfdPlotData = createPlotDataForCfd(dateWithStatesArray)

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

const cfdPlotCreated: Plot = {
    ...cfdPlotData[0],
    name: "To Do",
    type: "bar"
}

const cfdPlotDataInProgress: Plot = {
    ...cfdPlotData[1],
    name: "In Progress",
    type: "bar"
}

const cfdPlotDataResolved: Plot = {
    ...cfdPlotData[2],
    name: "Resolved",
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
        title: `% of issues completed (total: ${issuesCycleTimes.length}) `,
        range: [0, 100]
    }
}

const cfdLayout: Layout = {
    barmode: "stack",
    title: "Cumulative Flow Diagram (CFD)<br>(excluding Saturdays + Sundays)",
}

plot([histogramPlot], histogramLayout)
plot([percentagesPlot], percentagesLayout)
plot([cfdPlotDataResolved, cfdPlotDataInProgress, cfdPlotCreated], cfdLayout)


console.log("Done");

// -----------
function listHardcodedData(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQueryCycleTimes:", `"${jiraData.jiraJqlQueryCycleTimes}"`);
    console.log("jiraJqlQueryCfd:", `"${jiraData.jiraJqlQueryCfd}"`);
}

