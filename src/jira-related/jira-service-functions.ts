import * as _ from "lodash"
import { Issue } from "../core/core-interfaces";

export function createAuthorizationHeaderValue(jiraAuthEmail: string, jiraAuthToken: string): string {
    const base64Credentials = btoa(`${jiraAuthEmail}:${jiraAuthToken}`)
    const authHeaderValue = `Basic ${base64Credentials}`

    return authHeaderValue;
}

export function mapJiraResponseToBusinessObjects(jiraResponse: any): Issue[] {
    const issues: Issue[] = jiraResponse.issues.map((i: any) => {
        return {
            key: i.key,
            createdDate: new Date(i.fields.created),
            resolutionDate: new Date(i.fields.resolutiondate)
        }
    })

    return issues;
}

// https://digitalservicebund.atlassian.net/rest/api/2/issue/ndisc-40/changelog
export function getDateForStartingInProgressOfIssue(issueChangelog: any): Date | undefined {
    const values: any[] = issueChangelog.values
    // can we assume just one? #thisIsAHack
    const valueWithItemsFromToDoToInProgress = values.find(value => _.some(value.items, (item: any) => itemIsTransitionToInProgress(item)))

    if (!valueWithItemsFromToDoToInProgress)
        return undefined

    return new Date(valueWithItemsFromToDoToInProgress.created);
}

function itemComesFromToDo(item: any): boolean {
    return item.fromString === "To Do"
}

function itemGoesToInProgress(item: any): boolean {
    return item.toString === "In Progress"
}

function itemIsTransitionToInProgress(item: any): boolean {
    return itemComesFromToDo(item) && itemGoesToInProgress(item)
}

interface StateWithDate {
    stateName: string,
    stateReachedDate: Date
}

export function getAllStateChangesWithDates(issueChangelog: any): StateWithDate[] {
    const valuesWithStateChanges = issueChangelog.values.filter((v: any) => _.some(v.items, (item: any) => item.fieldId === "status"))
    const stateChanges: StateWithDate[] = _.flattenDeep(valuesWithStateChanges.map((v: any) => {
        const items = v.items
        const itemWithStateInfo = items.filter((i: any) => i.fieldId === "status")

        return itemWithStateInfo.map((i: any) => {
            return <StateWithDate>{
                stateName: i.toString,
                stateReachedDate: new Date(v.created)
            }
        })
    }))

    return stateChanges
}