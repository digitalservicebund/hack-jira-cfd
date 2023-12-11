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
    todoStateString: process.env.TODO_STATE_STRING!,
    inProgressStateString: process.env.IN_PROGRESS_STATE_STRING!
};
// ensureAllEnvVarsAreAvailable() // missing #thisIsAHack
listEnvVars(envVar);

const authHeaderValue = createAuthorizationHeaderValue(envVar.jiraAuthEmail, envVar.jiraAuthToken);

console.log("Fetching items according to JQL queries");

const jqlResultCycleTimes = await runJqlQueryAgainstJira(envVar.jiraJqlQueryCycleTimes, envVar.jiraApiBaseUrl, authHeaderValue);
// check if we reached the limit of 50 results // missing #thisIsAHack
const issuesForCycleTimes = mapJiraResponseToBusinessObjects(jqlResultCycleTimes);
console.log(`Found ${issuesForCycleTimes.length} issues for the cycle time graphs`);

const jqlResultsCfd = await runJqlQueryAgainstJira(envVar.jiraJqlQueryCfd, envVar.jiraApiBaseUrl, authHeaderValue);
// check if we reached the limit of 50 results // missing #thisIsAHack
const issuesForCfd = mapJiraResponseToBusinessObjects(jqlResultsCfd);
console.log(`Found ${issuesForCfd.length} issues for the CFD`);

console.log("Fetching changelogs");
const issuesWithChangelogsForCycleTimes: IssueWithChangelogs[] = await getChangelogsForIssues(issuesForCycleTimes, envVar.jiraApiBaseUrl, authHeaderValue);

const issuesWithChangelogsForCfd: IssueWithChangelogs[] = await getChangelogsForIssues(issuesForCfd, envVar.jiraApiBaseUrl, authHeaderValue);

const issuesWithStartDateForCycleTimes = issuesWithChangelogsForCycleTimes.map(issueWithChangelog => {
    const startedDate = getDateForStartingInProgressOfIssue(issueWithChangelog.changelog, envVar.todoStateString, envVar.inProgressStateString);
    return {
        ...issueWithChangelog.issue,
        startedDate: startedDate
    };
}).filter(iwd => iwd !== undefined);

// computing graph data
console.log("Computing graph data");

const cycleTimeHistogramData = getCycleTimeHistogram(issuesWithStartDateForCycleTimes);
const histogramPlotData = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData);
const percentagesPlotData = createPlotDataForPercentages(cycleTimeHistogramData);

const statesWithDatesArrayForCfd: StateWithDate[][] = issuesWithChangelogsForCfd.map((iwc: IssueWithChangelogs) =>
    getAllStatesWithDates(iwc.issue, iwc.changelog)
);
const cfdPlotData = createPlotDataForCfd(statesWithDatesArrayForCfd);

// define plots
const histogramPlot: Plot = {
    ...histogramPlotData,
    type: "bar"
};

const percentagesPlot: Plot = {
    ...percentagesPlotData,
    type: "scatter"
};

const cfdPlotCreated: Plot = {
    ...cfdPlotData[0],
    name: "To Do",
    type: "bar"
};

const cfdPlotDataInProgress: Plot = {
    ...cfdPlotData[1],
    name: "In Progress",
    type: "bar"
};

const cfdPlotDataResolved: Plot = {
    ...cfdPlotData[2],
    name: "Resolved",
    type: "bar"
};

const histogramLayout: Layout = {
    title: `Cycle Time Histogram (In Progress -> Done)`,
    xaxis: {
        title: `Working days until completion`
    },
    yaxis: {
        title: `# of issues (total: ${issuesForCycleTimes.length})`
    }
};

const percentagesLayout: Layout = {
    title: "Cycle Time Percentages",
    xaxis: {
        title: "Completed within x working days"
    },
    yaxis: {
        title: `% of issues completed (total: ${issuesForCycleTimes.length}) `,
        range: [0, 100]
    }
};

const cfdLayout: Layout = {
    barmode: "stack",
    title: "Cumulative Flow Diagram (CFD)<br>(excluding Saturdays + Sundays)",
};

const tableColumnValues = [
    [
        "JQL for cycle time graphs",
        "Number of issues for cycle time graphs",
        "JQL for CFD",
        "Number of issues for CFD"
    ],
    [
        `"${envVar.jiraJqlQueryCycleTimes}"`,
        issuesForCycleTimes.length,
        `"${envVar.jiraJqlQueryCfd}"`,
        issuesForCfd.length
    ]
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableData: any = [{
    type: 'table',
    header: {
        values: [
            ["<b>Additional Info</b>"], ["Value"]
        ],
        align: ["left", "center"],
        line: { width: 1, color: '#506784' },
        fill: { color: '#00ACC1' },
        font: { family: "Arial", size: 12, color: "white" }
    },
    cells: {
        values: tableColumnValues,
        align: ["left", "left"],
        line: { color: "#506784", width: 1 },
        fill: { color: ['#E0F7FA', 'white'] },
        font: { family: "Arial", size: 11, color: ["#506784"] }
    }
}];

// plot
plot([histogramPlot], histogramLayout);
plot([percentagesPlot], percentagesLayout);
plot([cfdPlotDataResolved, cfdPlotDataInProgress, cfdPlotCreated], cfdLayout);
plot(tableData);

console.log("Done");

// -----------
function listEnvVars(jiraData: JiraQueryDataForFetchingIssues): void {
    console.log("jiraEmail:", jiraData.jiraAuthEmail);
    console.log("jiraAuthToken:", `...${jiraData.jiraAuthToken.slice(-5)}`);
    console.log("jiraApiBaseUrl:", jiraData.jiraApiBaseUrl);
    console.log("jiraJqlQueryCycleTimes:", `"${jiraData.jiraJqlQueryCycleTimes}"`);
    console.log("jiraJqlQueryCfd:", `"${jiraData.jiraJqlQueryCfd}"`);
    console.log("todoStateString: ", `"${jiraData.todoStateString}"`);
    console.log("inProgressStateString: ", `"${jiraData.inProgressStateString}"`);
}

