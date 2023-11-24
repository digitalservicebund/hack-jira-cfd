import * as _ from "lodash";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import { plot, Plot, Layout } from "nodeplotlib"
import { cumsum } from "mathjs";
import { StateWithDate } from "../jira-related/jira-service-functions";
import { Issue } from "../core/core-interfaces";

export function createPlotDataFromCycleTimeHistogram(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot {
    const xValues = cycleTimeHistogram.map(entry => entry.numberOfDays)
    const yValues = cycleTimeHistogram.map(entry => entry.issueCount)
    const result: Plot = {
        x: xValues,
        y: yValues
    }

    return result;
}

export function createPlotDataForPercentages(cycleTimeHistogram: CycleTimeHistogramEntry[]): Plot {
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

export function createPlotDataForCfd(statesWithDates: StateWithDate[]): Plot {
    const dates = statesWithDates.map(s => s.stateReachedDate)
    const datesSorted = sortDates(dates)
    const result: Plot = {
        x: [],
        y: []
    }

    return result
}

export function sortDates(dates: Date[]): Date[] {
    return dates;
}