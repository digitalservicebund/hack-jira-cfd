import { describe, expect, test } from "bun:test";
import { jiraJqlQueryResponseBodyFixture } from "../../test-fixtures/jira-jql-query-response-fixture";
import { getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./jira-service-functions";
import { jiraChangelogQueryResponseBodyFixture } from "../../test-fixtures/jira-changelog-response-fixture";

describe("mapJiraResponseToBusinessObjects()", () => {
    const input = jiraJqlQueryResponseBodyFixture;
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
    const input = jiraChangelogQueryResponseBodyFixture
    const result = getDateForStartingInProgressOfIssue(input)

    test("it should return a date", () => {
        expect(result).toBeDate()
    })

    test("it should return '2023-11-03T09:58:19.762+0100'", () => {
        expect(result).toEqual(new Date("2023-11-03T09:58:19.762+0100"))
    })
})