import HumanizeDuration from 'humanize-duration';
import {k8s} from '../proto/proto';

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
        },
    },
});

/**
 * @param epochtimestampMs an epoch timestamp value (in ms)
 * @returns a "humanized" duration from now
 *
 */
export default function fromNow(
    epochtimestampMs: number | string | k8s.io.apimachinery.pkg.apis.meta.v1.ITime,
) {
    const diff = Date.now() - safeParseTimeToDate(epochtimestampMs).getTime();
    return formatDuration(diff);
}

export function safeParseTimeToDate(
    epochtimestampMs: number | string | k8s.io.apimachinery.pkg.apis.meta.v1.ITime,
) {
    if (
        typeof epochtimestampMs !== 'number'
    && typeof epochtimestampMs !== 'string'
    ) {
        return new Date(Number(epochtimestampMs.seconds) * 1000);
    }
    return new Date(epochtimestampMs);
}


/**
 * Humanize the given duration (in ms)
 * @param {diffDurationMs} diffDurationMs
 */
export function formatDuration(diffDurationMs: number) {
    return shortEnglishHumanizer(diffDurationMs).split(',')[0];
}
