import { describe, expect, test } from "bun:test";
import { Issue } from "./core-interfaces";
import { getCycleTimeHistogram } from "./core-functions";

describe("getCycleTimeHistogram", () => {
    const input: Issue[] = [{
        key: "issue1",
        createdDate: new Date("2023-11-06"),
        startedDate: new Date("2023-11-07"),
        resolutionDate: new Date("2023-11-10"),
    }, {
        key: "issue2",
        createdDate: new Date("2023-11-06"),
        startedDate: new Date("2023-11-08"),
        resolutionDate: new Date("2023-11-10"),
    }, {
        key: "issue3",
        createdDate: new Date("2023-11-06"),
        startedDate: new Date("2023-11-07"),
        resolutionDate: new Date("2023-11-09"),
    }]

    const result = getCycleTimeHistogram(input)

    test("to contain two entries", () => {
        expect(result).toBeArrayOfSize(2)
    })
})