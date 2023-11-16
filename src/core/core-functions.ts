import { Issue } from "./core-interfaces"
import { differenceInBusinessDays } from "date-fns"
import * as _ from "lodash"

export interface CycleTimeHistogramEntry {
    numberOfDays: number,
    issueCount: number
}

export function getCycleTimeHistogram(issues: Issue[]): CycleTimeHistogramEntry[] {
    const durations = issues.map(issue => {
        const durationDays = differenceInBusinessDays(issue.resolutionDate, issue.startedDate!)
        return durationDays
    })
    
    const durationsHistogramDictionary = _.countBy(durations, _.identity)

    const durationsHistogram = _.keys(durationsHistogramDictionary).map(key => ({
        numberOfDays: parseInt(key, 10),
        issueCount: durationsHistogramDictionary[key]
    }))
    
    return durationsHistogram;
}