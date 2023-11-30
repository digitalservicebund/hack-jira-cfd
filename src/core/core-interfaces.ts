export interface Issue {
    key: string,
    createdDate: Date,
    startedDate?: Date,
    resolutionDate: Date,

}

export interface IssueWithChangelogs {
    issue: Issue,
    changelog: any // #thisIsAHack
}
