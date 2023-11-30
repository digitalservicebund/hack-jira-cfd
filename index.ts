import _ from "lodash";
import { JiraQueryDataForFetchingIssues, getChangelogsForIssues, runJqlQueryAgainstJira } from "./src/jira-related/jira-client-functions";
import { StateWithDate, createAuthorizationHeaderValue, getAllStatesWithDates, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./src/jira-related/jira-service-functions";
import { createPlotDataForCfd, createPlotDataForPercentages, createPlotDataFromCycleTimeHistogram } from "./src/plotting/plotting-functions";
import { getCycleTimeHistogram } from "./src/core/core-functions";
import { Layout, Plot, plot } from "nodeplotlib";
import { IssueWithChangelogs } from "./src/core/core-interfaces";


console.log("Started");

const envVar: JiraQueryDataForFetchingIssues = {
    jiraApiBaseUrl: process.env.JIRA_API_BASE_URL!,
    jiraAuthEmail: process.env.ATLASSIAN_USER_EMAIL!,
    jiraAuthToken: process.env.ATLASSIAN_API_TOKEN!,
    jiraJqlQueryCycleTimes: process.env.JIRA_JQL_QUERY_CYCLE_TIMES!,
    jiraJqlQueryCfd: process.env.JIRA_JQL_QUERY_CFD!,

}
// ensureAllEnvVarsAreAvailable() // missing #thisIsAHack
listEnvVars(envVar)

const authHeaderValue = createAuthorizationHeaderValue(envVar.jiraAuthEmail, envVar.jiraAuthToken);

console.log("Fetching items according to JQL queries");

const jqlResultCycleTimes = await runJqlQueryAgainstJira(envVar.jiraJqlQueryCycleTimes, envVar.jiraApiBaseUrl, authHeaderValue)
// check if we reached the limit of 50 results // missing #thisIsAHack
const issuesForCycleTimes = mapJiraResponseToBusinessObjects(jqlResultCycleTimes)
console.log(`Found ${issuesForCycleTimes.length} issues for the cycle time graphs`);

const jqlResultsCfd = await runJqlQueryAgainstJira(envVar.jiraJqlQueryCfd, envVar.jiraApiBaseUrl, authHeaderValue)
// check if we reached the limit of 50 results // missing #thisIsAHack
const issuesForCfd = mapJiraResponseToBusinessObjects(jqlResultsCfd)
console.log(`Found ${issuesForCfd.length} issues for the CFD`);

console.log("Fetching changelogs");
const issuesWithChangelogsForCycleTimes: IssueWithChangelogs[] = await getChangelogsForIssues(issuesForCycleTimes, envVar.jiraApiBaseUrl, authHeaderValue)

const issuesWithChangelogsForCfd: IssueWithChangelogs[] = await getChangelogsForIssues(issuesForCfd, envVar.jiraApiBaseUrl, authHeaderValue)

const issuesWithStartDateForCycleTimes = issuesWithChangelogsForCycleTimes.map(issueWithChangelog => {
    const startedDate = getDateForStartingInProgressOfIssue(issueWithChangelog.changelog)
    return {
        ...issueWithChangelog.issue,
        startedDate: startedDate
    }
}).filter(iwd => iwd !== undefined)

// computing graph data
console.log("Computing graph data");

const cycleTimeHistogramData = getCycleTimeHistogram(issuesWithStartDateForCycleTimes)
const histogramPlotData = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)
const percentagesPlotData = createPlotDataForPercentages(cycleTimeHistogramData)

const statesWithDatesArrayForCfd: StateWithDate[][] = issuesWithChangelogsForCfd.map((iwc: IssueWithChangelogs) =>
    getAllStatesWithDates(iwc.issue, iwc.changelog)
)
const cfdPlotData = createPlotDataForCfd(statesWithDatesArrayForCfd)

// define plots
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
        title: `% of issues completed (total: ${issuesForCycleTimes.length}) `,
        range: [0, 100]
    }
}

const cfdLayout: Layout = {
    barmode: "stack",
    title: "Cumulative Flow Diagram (CFD)<br>(excluding Saturdays + Sundays)",
}

// plot
plot([histogramPlot], histogramLayout)
plot([percentagesPlot], percentagesLayout)
plot([cfdPlotDataResolved, cfdPlotDataInProgress, cfdPlotCreated], cfdLayout)


console.log("Done");

// -----------
function listEnvVars(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl)
    console.log("jiraJqlQueryCycleTimes:", `"${jiraData.jiraJqlQueryCycleTimes}"`);
    console.log("jiraJqlQueryCfd:", `"${jiraData.jiraJqlQueryCfd}"`);
}

