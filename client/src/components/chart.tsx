import _ from 'lodash';
import React from 'react';
import Donut from './donut';

type Props = {
    used?: number;
    usedSuffix?: string;
    available?: number;
    availableSuffix?: string;
    pending?: number;
    decimals?: number;
};

export default function Chart(props: Props) {
    const {used = 0, usedSuffix, available = 0, availableSuffix, pending = 0, decimals = 1} = props;

    const fixedUsed = _.round(used, decimals);
    const fixedPending = _.round(pending, decimals);
    const fixedAvailable = _.round(available, decimals);
    const {percent, percent2} = getData(fixedUsed, fixedPending, fixedAvailable);

    return (
        <div className='charts_donut'>
            <Donut percent={percent} percent2={percent2} />
            <span className='chart_donutLabel'>
                <div>
                    {Number.isFinite(fixedUsed) && (
                        <>
                            <span>{fixedUsed}</span>
                            {usedSuffix && (<span className='chart_innerLabel'>{usedSuffix}</span>)}
                        </>
                    )}
                </div>
                <div className='chart_innerLabel'>of</div>
                <div>
                    {Number.isFinite(fixedAvailable) && (
                        <>
                            <span>{fixedAvailable}</span>
                            {availableSuffix && (<span className='chart_innerLabel'>{availableSuffix}</span>)}
                        </>
                    )}
                </div>
            </span>
        </div>
    );
}

function getData(used: number, pending: number, available: number) {
    // If there's a negative amount remaining, show an all red chart
    const remaining = available - used - pending;
    if (remaining < 0) return {percent: 0, percent2: 1};

    // If there's no data, show an all grey chart
    if (!available) return {percent: 0, percent2: 0};

    const percent = used / available;
    const percent2 = pending / available;

    return {percent, percent2};
}
