import _ from "lodash";
import { Issue } from "../core/core-interfaces";
import { JiraChangelog, JiraChangelogValue, JiraChangelogValueItem, JiraQueryResponse } from "./jira-interfaces";

export function createAuthorizationHeaderValue(jiraAuthEmail: string, jiraAuthToken: string): string {
    const base64Credentials = btoa(`${jiraAuthEmail}:${jiraAuthToken}`);
    const authHeaderValue = `Basic ${base64Credentials}`;

    return authHeaderValue;
}

export function mapJiraResponseToBusinessObjects(jiraResponse: JiraQueryResponse): Issue[] {
    const issues: Issue[] = jiraResponse.issues.map(i => {
        return {
            key: i.key,
            createdDate: new Date(i.fields.created),
            resolutionDate: new Date(i.fields.resolutiondate)
        };
    });

    return issues;
}

// https://digitalservicebund.atlassian.net/rest/api/2/issue/ndisc-40/changelog
export function getDateForStartingInProgressOfIssue(
    issueChangelog: JiraChangelog,
    todoStateString: string,
    inProgressStateString: string): Date | undefined {

    const values: JiraChangelogValue[] = issueChangelog.values;
    // can we assume just one? #thisIsAHack
    const valueWithItemsFromToDoToInProgress = values.find(value => _.some(value.items, item => itemIsTransitionToInProgress(item, todoStateString, inProgressStateString)));

    if (!valueWithItemsFromToDoToInProgress)
        return undefined;

    return new Date(valueWithItemsFromToDoToInProgress.created);
}

function itemComesFromState(item: JiraChangelogValueItem, stateString: string): boolean {
    return item.fromString === stateString;
}

function itemGoesToState(item: JiraChangelogValueItem, stateString: string): boolean {
    return item.toString === stateString;
}

function itemIsTransitionToInProgress(item: JiraChangelogValueItem, todoStateString: string, inProgressStateString: string): boolean {
    return itemComesFromState(item, todoStateString) && itemGoesToState(item, inProgressStateString);
}

export interface StateWithDate {
    stateName: string,
    stateReachedDate: Date
}

export function getAllStateChangesWithDates(issueChangelog: JiraChangelog): StateWithDate[] {
    const valuesWithStateChanges = issueChangelog.values.filter(v => _.some(v.items, item => item.fieldId === "status"));
    const stateChanges: StateWithDate[] = _.flattenDeep(valuesWithStateChanges.map(v => {
        const items = v.items;
        const itemWithStateInfo = items.filter(i => i.fieldId === "status");

        return itemWithStateInfo.map(i => {
            return <StateWithDate>{
                stateName: i.toString,
                stateReachedDate: new Date(v.created)
            };
        });
    }));

    return stateChanges;
}

export function getAllStatesWithDates(issue: Issue, issueChangelog: JiraChangelog): StateWithDate[] {
    const initialState: StateWithDate = {
        stateName: "Created",
        stateReachedDate: issue.createdDate
    };
    const stateChanges = getAllStateChangesWithDates(issueChangelog);
    const result = [
        initialState,
        ...stateChanges
    ];
    return result;
}
