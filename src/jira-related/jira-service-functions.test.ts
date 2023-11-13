import { describe, expect, test } from "bun:test";
import { jiraResponseBodyFixture } from "../../test-fixtures/jira-response-body";
import { mapJiraResponseToBusinessObjects } from "./jira-service-functions";

describe("mapJiraResponseToBusinessObjects()", () => {
    const input = jiraResponseBodyFixture;
    const result = mapJiraResponseToBusinessObjects(input)

    test("issues to have a 'key' string property", () => {
        expect(result[0].key).toBeString();
    })

    test("issues to have a 'createdDate' date property", () => {
        expect(result[0].createdDate).toBeDate();
    })

    test("issue to have a 'resolutionDate' date property", () => {
        expect(result[0].resolutionDate).toBeDate();
    })
})

describe("getDateForStartingInProgressOfIssue()", () => {
    test("", () => {
        expect(true).toBeFalse()
    })
})