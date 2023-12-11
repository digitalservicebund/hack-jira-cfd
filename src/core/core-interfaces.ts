export interface Issue {
    key: string,
    createdDate: Date,
    startedDate?: Date,
    resolutionDate: Date,

}

export interface IssueWithChangelogs {
    issue: Issue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changelog: any // #thisIsAHack
}
