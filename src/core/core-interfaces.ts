import { JiraChangelog } from "../jira-related/jira-interfaces";

export interface Issue {
    key: string,
    createdDate: Date,
    startedDate?: Date,
    resolutionDate: Date,

}

export interface IssueWithChangelogs {
    issue: Issue,
    changelog: JiraChangelog // #thisIsAHack
}
