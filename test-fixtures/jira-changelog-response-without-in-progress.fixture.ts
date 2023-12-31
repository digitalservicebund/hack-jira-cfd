export const jiraChangelogWithoutProgressQueryResponseBodyFixture = {
    "self": "hidden",
    "maxResults": 100,
    "startAt": 0,
    "total": 6,
    "isLast": true,
    "values": [
        { // irrelevant change
            "id": "70400",
            "author": {
                "self": "hidden",
                "accountId": "hidden",
                "emailAddress": "hidden",

                "displayName": "hidden",
                "active": true,
                "timeZone": "Europe/Berlin",
                "accountType": "atlassian"
            },
            "created": "2023-11-02T10:22:23.784+0100",
            "items": [
                {
                    "field": "hidden",
                    "fieldtype": "custom",
                    "fieldId": "hidden",
                    "from": "",
                    "fromString": "string 1",
                    "to": "",
                    "toString": "string 2"
                }
            ]
        },
        { // To Do -> Done
            "id": "70805",
            "author": {
                "self": "hidden",
                "accountId": "hidden",
                "emailAddress": "hidden",
                "displayName": "hidden",
                "active": true,
                "timeZone": "Europe/Berlin",
                "accountType": "atlassian"
            },
            "created": "2023-11-07T09:46:08.367+0100",
            "items": [
                {
                    "field": "resolution",
                    "fieldtype": "jira",
                    "fieldId": "resolution",
                    "from": null,
                    "fromString": null,
                    "to": "10000",
                    "toString": "Done"
                },
                {
                    "field": "status",
                    "fieldtype": "jira",
                    "fieldId": "status",
                    "from": "10124",
                    "fromString": "To Do",
                    "to": "10125",
                    "toString": "Done"
                }
            ]
        }
    ]
};