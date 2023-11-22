import { describe, expect, test } from "bun:test";
import { jiraJqlQueryResponseBodyFixture } from "../../test-fixtures/jira-jql-query-response-fixture";
import { getAllStateChangesWithDates, getDateForStartingInProgressOfIssue, mapJiraResponseToBusinessObjects } from "./jira-service-functions";
import { jiraChangelogQueryResponseBodyFixture } from "../../test-fixtures/jira-changelog-response-fixture";
import { jiraChangelogWithoutProgressQueryResponseBodyFixture } from "../../test-fixtures/jira-changelog-response-without-in-progress.fixture";

describe("mapJiraResponseToBusinessObjects()", () => {
    const input = jiraJqlQueryResponseBodyFixture;
    const result = mapJiraResponseToBusinessObjects(input)

    test("issues to have a 'key' string property", () => {
        expect(result[0].key).toBeString();
    })

    test("issues to have a 'createdDate' date property with value '2023-11-02T10:02:34.255+0100'", () => {
        expect(result[0].createdDate).toBeDate();
        expect(result[0].createdDate).toEqual(new Date("2023-11-02T10:02:34.255+0100"))
    })

    test("issue to have a 'resolutionDate' date property with value '2023-11-07T09:46:08.298+0100'", () => {
        expect(result[0].resolutionDate).toBeDate();
        expect(result[0].resolutionDate).toEqual(new Date("2023-11-07T09:46:08.298+0100"))
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

    test("it should return undefined if no start is found", () => {
        const inputWithoutEverBeenStarted = jiraChangelogWithoutProgressQueryResponseBodyFixture
        const result = getDateForStartingInProgressOfIssue(inputWithoutEverBeenStarted)

        expect(result).toBeUndefined()
    })
})

describe("getAllStateChangesWithDates()", () => {
    const input = jiraChangelogQueryResponseBodyFixture
    const result = getAllStateChangesWithDates(input)

    test("it should return two states", () => {
        expect(result).toHaveLength(2)
    })

    test("it should return date '2023-11-03T09:58:19.762+0100' for 'In Progress' state change", () => {
        console.log("RESULT", JSON.stringify(result, null, 2))
        const inProgressStateChange = result.find(r => r.stateName === "In Progress")
        
        expect(inProgressStateChange!.stateReachedDate).toEqual(new Date("2023-11-03T09:58:19.762+0100"))
    })
})