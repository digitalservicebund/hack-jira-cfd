import { create } from "lodash";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import { plot, Plot, Layout } from "nodeplotlib"

export function plotCycleTimeHistogram(cycleTimeHistogramData: CycleTimeHistogramEntry[]): void {
    const data: Plot[] = createPlotDataFromCycleTimeHistogram(cycleTimeHistogramData)

    plot(data);
}

export function createPlotDataFromCycleTimeHistogram(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot[] {
    const xValues = cycleTimeHistogram.map(entry => entry.numberOfDays)
    const yValues = cycleTimeHistogram.map(entry => entry.issueCount)
    const result: Plot[] = [{
        x: xValues,
        y: yValues,
        type: "bar"
    }]

    return result;
}