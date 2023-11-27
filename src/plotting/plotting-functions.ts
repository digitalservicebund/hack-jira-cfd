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
    statesCounts:
    {
        stateName: string;
        stateCount: number;
    }[]
}

export enum State {
    created = "Created",
    inProgress = "In Progress",
    done = "Done"
}

export function createPlotDataForCfd(statesWithDatesArray: StateWithDate[][]): Plot[] {
    // get dates
    const dates = _.flattenDeep(statesWithDatesArray.map(swd => swd.map(s => s.stateReachedDate)))
    const datesSorted = sortDates(dates)
    const startDate = _.first(datesSorted)
    const endDate = _.last(datesSorted)
    const dateList = eachDayOfInterval({
        start: startDate!,
        end: endDate!
    })

    const statesCounts: StatesCountsPerDay[] = dateList.map(date => {
        // TODO: go through states, simplify
        const createdCount = _.sum(statesWithDatesArray.map(swd => {
            return inStateAtDay(date, State.created, swd)
        }).map(result => result === true ? 1 : 0))

        const inProgressCount = _.sum(statesWithDatesArray.map(swd => {
            return inStateAtDay(date, State.inProgress, swd)
        }).map(result => result === true ? 1 : 0))

        const doneCount = _.sum(statesWithDatesArray.map(swd => {
            return inStateAtDay(date, State.done, swd)
        }).map(result => result === true ? 1 : 0))



        return <StatesCountsPerDay>{
            day: date,
            statesCounts: [{
                stateName: State.created,
                stateCount: createdCount
            }, {
                stateName: State.inProgress,
                stateCount: inProgressCount
            }, {
                stateName: State.done,
                stateCount: doneCount
            }]
        }
    })

    // const statesCountsPerDay: StatesCountsPerDay[] = dateList.map(day => inStateAtDay(day, statesWithDatesArray))

    const resultCreated: Plot = {
        x: statesCounts.map(sc => sc.day),
        y: statesCounts.map(sc => {
            return sc.statesCounts.find(s => s.stateName === State.created)?.stateCount!
        })
    }
    const resultInProgress: Plot = {
        x: statesCounts.map(sc => sc.day),
        y: statesCounts.map(sc => {
            return sc.statesCounts.find(s => s.stateName === State.inProgress)?.stateCount!
        })
    }
    const resultDone: Plot = {
        x: statesCounts.map(sc => sc.day),
        y: statesCounts.map(sc => {
            return sc.statesCounts.find(s => s.stateName === State.done)?.stateCount!
        })
    }

    return [resultCreated, resultInProgress, resultDone]
}

export function inStateAtDay(day: Date, stateName: string, statesWithDates: StateWithDate[]): boolean {
    const statesWithDatesSorted = _.sortBy(statesWithDates, s => s.stateReachedDate)
    const stateWithDateIndex = statesWithDatesSorted.findIndex(s => s.stateName === stateName)

    if (stateWithDateIndex === -1) {
        return false
    }

    const stateWithDate = statesWithDatesSorted[stateWithDateIndex]

    if (stateWithDateIndex > statesWithDates.length - 2) {
        if (day > stateWithDate.stateReachedDate) return true
        else return false
    }

    const nextStateWithDate = statesWithDatesSorted[stateWithDateIndex + 1]

    if (day >= stateWithDate.stateReachedDate
        && day < nextStateWithDate.stateReachedDate) {
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