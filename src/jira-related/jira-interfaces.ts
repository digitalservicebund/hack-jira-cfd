/* eslint-disable @typescript-eslint/no-explicit-any */
export interface JiraChangelog {
    values: JiraChangelogValue[],
    [key: string]: any;
}

export interface JiraChangelogValue {
    created: string,
    items: {
        fromString: string | null,
        toString: string,
        [key: string]: any;
    }[],
    [key: string]: any;
}