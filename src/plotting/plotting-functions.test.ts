import { describe, expect, test } from "bun:test";
import { createPlotDataFromCycleTimeHistogram } from "./plotting-functions";
import { CycleTimeHistogramEntry } from "../core/core-functions";

describe("createPlotDataFromCycleTimeHistogram()", () => {
    const input: CycleTimeHistogramEntry[] = [{
        numberOfDays: 2,
        issueCount: 2
    }, {
        numberOfDays: 3,
        issueCount: 1
    }]

    const result = createPlotDataFromCycleTimeHistogram(input);

    test("should return an array of length one", () => {
        expect(result).toBeArrayOfSize(1)
    })

    test("should return an array in properties 'x' and 'y'", () => {
        expect(result[0].x).toBeArray();
        expect(result[0].y).toBeArray();
    })

    test("should return the number of days in 'x' property", () => {
        expect(result[0].x).toEqual([2, 3])
    })

    test("should return the issue count in 'y' property", () => {
        expect(result[0].y).toEqual([2, 1])
    })
})