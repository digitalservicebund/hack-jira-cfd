import { CycleTimeHistogramEntry } from "../core/core-functions";
import { plot, Plot } from "nodeplotlib"

export function plotCycleTimeHistogram(cycleTimeHistogramData: CycleTimeHistogramEntry[]): void {
    const data: Plot[] = [
        {
            x: [1, 3, 4, 5],
            y: [3, 12, 1, 4],
            type: 'scatter',
        },
    ];

    // plot(data);
}

export function createPlotDataFromCycleTimeHistogram(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot[] {
    const result = [{
        x: [],
        y: []
    }]
    return result;
}