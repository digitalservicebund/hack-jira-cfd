import { Issue } from "./core-interfaces"
import { differenceInBusinessDays } from "date-fns"
import * as _ from "lodash"

export interface CycleTimeHistogramEntry {
    numberOfDays: number,
    issueCount: number
}

export function getCycleTimeHistogram(issues: Issue[]): CycleTimeHistogramEntry[] {
    const cycleTimes = issues.map(issue => {
        const cycleTimeInDays = differenceInBusinessDays(issue.resolutionDate, issue.startedDate!)
        return cycleTimeInDays
    })
    
    const cycleTimeHistogramDictionary = _.countBy(cycleTimes, _.identity)

    const cycleTimeHistogram = _.keys(cycleTimeHistogramDictionary).map(key => ({
        numberOfDays: parseInt(key, 10),
        issueCount: cycleTimeHistogramDictionary[key]
    }))
    
    return cycleTimeHistogram;
}