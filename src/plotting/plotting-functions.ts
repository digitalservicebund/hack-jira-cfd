import * as _ from "lodash";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import { plot, Plot, Layout } from "nodeplotlib"
import { cumsum } from "mathjs";

export function plotCycleTimeHistogram(cycleTimeHistogramData: CycleTimeHistogramEntry[]): void {
    const data: Plot[] = [
        createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)
    ]

    plot(data);
}

export function createPlotDataFromCycleTimeHistogram(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot {
    const xValues = cycleTimeHistogram.map(entry => entry.numberOfDays)
    const yValues = cycleTimeHistogram.map(entry => entry.issueCount)
    const result: Plot = {
        x: xValues,
        y: yValues,
        type: "bar"
    }

    return result;
}

export function createPlotDataForLikelyhoods(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot {
    const totalIssueCount = _.sum(cycleTimeHistogram.map(e => e.issueCount))
    const histogramIssueCounts = cycleTimeHistogram.map(e => e.issueCount)
    const histogramIssueCountSums = valuesSummedUp(histogramIssueCounts)

    const yValues = histogramIssueCountSums.map(e => e / totalIssueCount * 100)
    const xValues = cycleTimeHistogram.map(e => e.numberOfDays)
    
    const result: Plot = {
        x: xValues,
        y: yValues
    }
    return result
}

export function valuesSummedUp(values: number[]): number[] {
    const cumulativeSum = cumsum(values)
    return <number[]>cumsum(values)
}