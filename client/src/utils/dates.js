import HumanizeDuration from 'humanize-duration'

/**
 * A simple humanizer to merely differentiate between months and minutes.
 * (Could be improved later for i18n)
 */
const shortEnglishHumanizer = HumanizeDuration.humanizer({
    language: 'shortEn',
    languages: {
      shortEn: {
        y: () => 'y',
        mo: () => 'mo',
        w: () => 'w',
        d: () => 'd',
        h: () => 'h',
        m: () => 'm',
        s: () => 's',
        ms: () => 'ms',
      }
    }
  })

 /**
  * @param epochtimestampMs an epoch timestamp value (in ms)
  * @returns a "humanized" duration from now
  * 
  */ 
export default function fromNow(epochtimestampMs) {
    var diff = Date.now() - new Date(epochtimestampMs).getTime()
    return shortEnglishHumanizer(diff).split(",")[0]
}
