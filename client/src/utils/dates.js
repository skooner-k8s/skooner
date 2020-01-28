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
    const diff = Date.now() - new Date(epochtimestampMs).getTime();
    return formatDuration(diff);
}


/**
 * Humanize the given duration (in ms)
 * @param {diffDurationMs} diffDurationMs 
 */
export function formatDuration(diffDurationMs){
     return shortEnglishHumanizer(diffDurationMs).split(",")[0];
} 
