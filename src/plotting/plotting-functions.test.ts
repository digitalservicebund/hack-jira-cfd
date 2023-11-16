import { describe, expect, test } from "bun:test";
import { createPlotDataFromCycleTimeHistogram } from "./plotting-functions";
import { CycleTimeHistogramEntry } from "../core/core-functions";

describe("createPlotDataFromCycleTimeHistogram()", () =>{
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
})