/* eslint-disable @typescript-eslint/no-explicit-any */
export interface JiraChangelog {
    values: {
        created: string,
        items: {
            fromString: string | null,
            toString: string,
            [key: string]: any;
        }[],
        [key: string]: any;
    }[],
    [key: string]: any;
}