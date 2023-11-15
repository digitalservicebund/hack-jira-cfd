import { Issue } from "../..";
import * as _ from "lodash"

export function createAuthorizationHeaderValue(jiraAuthEmail: string, jiraAuthToken: string): string {
    const base64Credentials = btoa(`${jiraAuthEmail}:${jiraAuthToken}`)
    const authHeaderValue = `Basic ${base64Credentials}`

    return authHeaderValue;
}

export function mapJiraResponseToBusinessObjects(jiraResponse: any): Issue[] {
    const issues: Issue[] = jiraResponse.issues.map((i: any) => {
        console.log(i);
        
        return {
            key: i.key,
            createdDate: new Date(i.fields.created),
            resolutionDate: new Date(i.fields.resolutiondate)
        }
    })

    return issues;
}

// https://digitalservicebund.atlassian.net/rest/api/2/issue/ndisc-40/changelog
export function getDateForStartingInProgressOfIssue(issueChangelog: any): Date {
    const values: any[] = issueChangelog.values
    // can we assume just one? #thisIsAHack
    const valueWithItemsFromToDoToInProgress = values.find(value => _.some(value.items, (item: any) => itemIsTransitionToInProgress(item)))
    
    return new Date(valueWithItemsFromToDoToInProgress.created);
}

function itemComesFromToDo(item: any) {
    return item.fromString === "To Do"
}

function itemGoesToInProgress(item: any) {
    return item.toString === "In Progress"
}

function itemIsTransitionToInProgress(item: any) {
    return itemComesFromToDo(item) && itemGoesToInProgress(item)
}