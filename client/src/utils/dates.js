import moment from 'moment';

export default function formatDate(value) {
    const date = moment(value);
    const format = date.isSame(moment(), 'day') ? 'h:mma' : 'M/D/YY h:mma';
    return date.format(format);
}
