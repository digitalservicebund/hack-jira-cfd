import * as _ from "lodash";
import { CycleTimeHistogramEntry } from "../core/core-functions";
import { Plot } from "nodeplotlib"
import { cumsum, index } from "mathjs";
import { StateWithDate } from "../jira-related/jira-service-functions";
import { Interval, eachDayOfInterval, getDay, isWithinInterval } from "date-fns";

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

interface StatesCountsPerDay {
    day: Date;
    statesCounts: [
        {
            stateName: string;
            stateCount: number;
        }
    ]

}

export function createPlotDataForCfd(statesWithDatesArray: StateWithDate[][]): Plot[] {
    // get dates
    const dates = _.flattenDeep(statesWithDatesArray.map(swd => swd.map(s => s.stateReachedDate)))
    const datesSorted = sortDates(dates)
    const startDate = _.first(datesSorted)
    const endDate = _.last(datesSorted)
    const dateList = eachDayOfInterval({ start: startDate!, end: endDate! })

    // hardcoded states #thisIsAHack
    const statesInSequence = [
        "created",
        "To Do",
        "Done"
    ]

    // const statesCountsPerDay: StatesCountsPerDay[] = dateList.map(day => inStateAtDay(day, statesWithDatesArray))

    const result: Plot = {
        x: dateList,
        y: []
    }

    console.log("RESULT", JSON.stringify(result, null, 2));

    return [result]
}

export function inStateAtDay(day: Date, stateName: string, statesWithDates: StateWithDate[]): boolean {
    const statesWithDatesSorted = _.sortBy(statesWithDates, s => s.stateReachedDate)
    const stateWithDateIndex = statesWithDatesSorted.findIndex(s => s.stateName === stateName)
    const stateWithDate = statesWithDatesSorted[stateWithDateIndex]

    if (stateWithDateIndex > statesWithDates.length - 2) {
        if (day < stateWithDate.stateReachedDate) return true
        else return false
    }

    const nextStateWithDate = statesWithDatesSorted[stateWithDateIndex + 1]

    if (day >= stateWithDate.stateReachedDate
        && day <= nextStateWithDate.stateReachedDate) {
        return true
    }
    else {
        return false
    }
}

export function sortDates(dates: Date[]): Date[] {
    const result = dates.sort((a, b) => a.getTime() - b.getTime())
    return dates;
}