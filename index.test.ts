import { describe, expect, test } from "bun:test";
import { jiraResponseBodyFixture } from "./test-fixtures/jira-response-body";
import { mapJiraResponseToBusinessObjects } from ".";

describe("mapJiraResponseToBusinessObjects()", () => {
    const input = jiraResponseBodyFixture;
    const result = mapJiraResponseToBusinessObjects(input)
    test("issues to have a 'key' property", () => {
        expect(result[0].key).toBeString();
    })

    // test("issues to have a 'fields' array", () => {
    //     expect(true).toBeFalse()
    // })
})
