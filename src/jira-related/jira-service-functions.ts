import _ from "lodash";
import { Issue } from "../core/core-interfaces";
import { JiraChangelog } from "./jira-interfaces";

export function createAuthorizationHeaderValue(jiraAuthEmail: string, jiraAuthToken: string): string {
    const base64Credentials = btoa(`${jiraAuthEmail}:${jiraAuthToken}`);
    const authHeaderValue = `Basic ${base64Credentials}`;

    return authHeaderValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapJiraResponseToBusinessObjects(jiraResponse: any): Issue[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issues: Issue[] = jiraResponse.issues.map((i: any) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = issueChangelog.values;
    // can we assume just one? #thisIsAHack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valueWithItemsFromToDoToInProgress = values.find(value => _.some(value.items, (item: any) => itemIsTransitionToInProgress(item, todoStateString, inProgressStateString)));

    if (!valueWithItemsFromToDoToInProgress)
        return undefined;

    return new Date(valueWithItemsFromToDoToInProgress.created);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemComesFromState(item: any, stateString: string): boolean {
    return item.fromString === stateString;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemGoesToState(item: any, stateString: string): boolean {
    return item.toString === stateString;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemIsTransitionToInProgress(item: any, todoStateString: string, inProgressStateString: string): boolean {
    return itemComesFromState(item, todoStateString) && itemGoesToState(item, inProgressStateString);
}

export interface StateWithDate {
    stateName: string,
    stateReachedDate: Date
}

export function getAllStateChangesWithDates(issueChangelog: JiraChangelog): StateWithDate[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valuesWithStateChanges = issueChangelog.values.filter((v: any) => _.some(v.items, (item: any) => item.fieldId === "status"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stateChanges: StateWithDate[] = _.flattenDeep(valuesWithStateChanges.map((v: any) => {
        const items = v.items;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemWithStateInfo = items.filter((i: any) => i.fieldId === "status");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return itemWithStateInfo.map((i: any) => {
            return <StateWithDate>{
                stateName: i.toString,
                stateReachedDate: new Date(v.created)
            };
        });
    }));

    return stateChanges;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllStatesWithDates(issue: Issue, issueChangelog: any): StateWithDate[] {
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
