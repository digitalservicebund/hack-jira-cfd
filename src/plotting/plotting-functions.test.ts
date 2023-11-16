import { describe, expect, test } from "bun:test";
import { createPlotDataForLikelyhoods, createPlotDataFromCycleTimeHistogram, valuesSummedUp } from "./plotting-functions";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import * as _ from "lodash"

describe("createPlotDataFromCycleTimeHistogram()", () => {
    const input: CycleTimeHistogramEntry[] = [{
        numberOfDays: 2,
        issueCount: 2
    }, {
        numberOfDays: 3,
        issueCount: 1
    }]

    const result = createPlotDataFromCycleTimeHistogram(input);

    test("should return defined", () => {
        expect(result).toBeDefined()
    })

    test("should return properties 'x' and 'y'", () => {
        expect(result.x).toBeArray();
        expect(result.y).toBeArray();
    })

    test("should return the number of days in 'x' property", () => {
        expect(result.x).toEqual([2, 3])
    })

    test("should return the issue count in 'y' property", () => {
        expect(result.y).toEqual([2, 1])
    })

    test("should return 'bar' in 'type' property", () => {
        expect(result.type).toEqual('bar')
    })

    // TODO: fill in 0 valued entries for 0, 1, etc. days if they don't exist in the dataset
})

describe("valuesSummedUp()", () => {
    const input = [0, 1, 1, 5, 0, 3]
    const expectedResult = [0, 1, 2, 7, 7, 10]

    const result = valuesSummedUp(input)
    test("should sum up", () => {
        expect(result).toEqual(expectedResult)
    })
})

describe("createPlotDataForLikelyhoods()", () => {
    const input: CycleTimeHistogramEntry[] = [{
        numberOfDays: 2,
        issueCount: 2
    }, {
        numberOfDays: 3,
        issueCount: 1
    }]

    const totalIssueCount = _.sum(input.map(e => e.issueCount))

    const result = createPlotDataForLikelyhoods(input)

    test("should return properties 'x' and 'y'", () => {
        expect(result.x).toBeArray();
        expect(result.y).toBeArray();
    })

    test("should return 100 percent at the last datapoint", () => {
        expect(_.last(<number[]>result.y)).toEqual(100)
    })

    test("should return as many percentages as the input has entries", () => {
        expect(result.y).toHaveLength(input.length)
    })

    test("should return ~66.6% at 2 days", () => {
        expect((<number[]>result.y)[0]).toEqual(input[0].issueCount / totalIssueCount * 100)
    })
})

