import { describe, expect, test } from "bun:test";
import { createPlotDataForCfd, createPlotDataForPercentages as createPlotDataForPercentages, createPlotDataFromCycleTimeHistogram, sortDates, valuesSummedUp } from "./plotting-functions";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import * as _ from "lodash"
import { Plot } from "nodeplotlib";
import { Issue } from "../core/core-interfaces";
import { StateWithDate } from "../jira-related/jira-service-functions";

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

describe("createPlotDataForPercentages()", () => {
    const input: CycleTimeHistogramEntry[] = [{
        numberOfDays: 2,
        issueCount: 2
    }, {
        numberOfDays: 3,
        issueCount: 1
    }]

    const totalIssueCount = _.sum(input.map(e => e.issueCount))

    const result = createPlotDataForPercentages(input)

    test("should return properties 'x' and 'y'", () => {
        expect(result.x).toBeArray();
        expect(result.y).toBeArray();
    })

    describe("y values", () => {
        test("should return 100 percent at the last datapoint", () => {
            expect(_.last(<number[]>result.y)).toEqual(100)
        })

        test("should return as many percentages as the input has entries", () => {
            expect(result.y).toHaveLength(input.length)
        })

        test("should return ~66.6% as first and 100 as second value", () => {
            expect(<number[]>result.y).toEqual([2 / 3 * 100, 100])
        })
    })

    test("should return 2 and 3 as x entries", () => {
        expect(<number[]>result.x).toEqual([2, 3])
    })
})

describe("createDataForCfd()", () => {
    const statesWithDates: StateWithDate[] = []
    const result = createPlotDataForCfd(statesWithDates)

    test("it should have '2023-10-30' as the first x value", () => {
        expect(result.x![0]).toEqual("2023-10-30")
    })
})

describe("sortDates()", () => {
    const dates = [
        new Date("2023-02-02"),
        new Date("2023-03-03"),
        new Date("2023-01-01")
    ]

    const result = sortDates(dates)

    test("should order ascending", ()=> {
        expect(result).toEqual([
            new Date("2023-01-01"), 
            new Date("2023-02-02"),
            new Date("2023-03-03")
        ])
    })
})