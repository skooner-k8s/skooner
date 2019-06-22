import timeAgo from 'time-ago';

export default function fromNow(value) {
    return timeAgo.ago(value, true);
}
