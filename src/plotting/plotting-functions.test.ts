import { describe, expect, test } from "bun:test";
import { createPlotDataForCfd, createPlotDataForPercentages as createPlotDataForPercentages, createPlotDataFromCycleTimeHistogram, inStateAtDay, sortDates, valuesSummedUp } from "./plotting-functions";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import * as _ from "lodash"
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

// TODO: 

// getFirstAndLastDate() must work on multiple arrays of statesWithDates

// calculate interval across all statesWithDates arrays

// for each day of the interval
// => determine state of each ticket
// => count the tickets for each state
// => return an array of a plotting datasets, one for each state

describe("createDataForCfd()", () => {
    const statesWithDates: StateWithDate[][] = [
        [
            {
                stateName: "resolved",
                stateReachedDate: new Date("2023-01-04")
            },
            {
                stateName: "To Do",
                stateReachedDate: new Date("2023-01-02")
            },
            {
                stateName: "created",
                stateReachedDate: new Date("2023-01-01")
            }
        ], [
            {
                stateName: "resolved",
                stateReachedDate: new Date("2023-01-05")
            },
            {
                stateName: "To Do",
                stateReachedDate: new Date("2023-01-04")
            },
            {
                stateName: "created",
                stateReachedDate: new Date("2023-01-03")
            }
        ]
    ]
    const result = createPlotDataForCfd(statesWithDates)


    describe("x values", () => {
        const firstPlot = result[0]

        test("it should have '2023-01-01' as the first x value of first ", () => {
            expect(firstPlot.x![0]).toEqual(new Date("2023-01-01"))
        })

        test("it should have '2023-01-04' as last x value", () => {
            expect(_.last(<Date[]>firstPlot.x)).toEqual(new Date("2023-01-05"))
        })

        test("it should have all days between first and last date as x values", () => {
            expect(firstPlot.x).toEqual([
                new Date("2023-01-01"),
                new Date("2023-01-02"),
                new Date("2023-01-03"),
                new Date("2023-01-04"),
                new Date("2023-01-05"),
            ])
        })
    })

    describe("y values", () => {
        const firstPlot = result[0]

        test("it should return counts of 'created'", () => {
            expect(firstPlot.y).toEqual([1, 0, 1, 0, 0])
        })

        // TODO: counts of "In Progress"
        // TODO: counts of "resolved" <-- maybe not necessary
    })
})

describe("inStateAtDay()", () => {
    const day = new Date("2023-01-01")
    const statesWithDates: StateWithDate[] = [
        {
            stateName: "resolved",
            stateReachedDate: new Date("2023-01-04")
        },
        {
            stateName: "To Do",
            stateReachedDate: new Date("2023-01-02")
        },
        {
            stateName: "created",
            stateReachedDate: new Date("2023-01-01")
        }
    ]


    test("it should return true for '2023-01-01' and state 'created' as the dates match ", () => {
        const result = inStateAtDay(day, "created", statesWithDates)
        expect(result).toBeTrue()
    })

    test("it should return false for '2023-01-01' and state 'To Do' as the dates do not match", () => {
        const result = inStateAtDay(day, "To Do", statesWithDates)
        expect(result).toBeFalse()
    })

    test("it should return false for '2023-01-02' and state 'created' as there's already the next state", () => {
        const day = new Date("2023-01-02")
        const result = inStateAtDay(day, "created", statesWithDates)
        expect(result).toBeFalse()
    })

    test("it should return true for '2023-01-07' and state 'resolved' as it was resolved way before", () => {
        const result = inStateAtDay(day, "resolved", statesWithDates)
        expect(result).toBeTrue()
    })
})

describe("sortDates()", () => {
    const dates = [
        new Date("2023-02-02"),
        new Date("2023-03-03"),
        new Date("2023-01-01")
    ]

    const result = sortDates(dates)

    test("should order ascending", () => {
        expect(result).toEqual([
            new Date("2023-01-01"),
            new Date("2023-02-02"),
            new Date("2023-03-03")
        ])
    })
})