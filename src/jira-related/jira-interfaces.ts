/* eslint-disable @typescript-eslint/no-explicit-any */
export interface JiraChangelog {
    values: JiraChangelogValue[],
    [key: string]: any;
}

export interface JiraChangelogValue {
    created: string,
    items: JiraChangelogValueItem[],
    [key: string]: any;
}

export interface JiraChangelogValueItem {
    fromString: string | null,
    toString: string,
    [key: string]: any;
}