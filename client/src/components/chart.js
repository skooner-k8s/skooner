import _ from 'lodash';
import React from 'react';
import ChartistGraph from 'react-chartist';

const options = {
    donut: true,
    donutWidth: 23,
    donutSolid: true,
    startAngle: 0,
    showLabel: false,
};

export default function Chart({used = 0, usedSuffix, available = 0, availableSuffix, pending = 0, decimals = 1}) { // eslint-disable-line max-len
    const fixedUsed = _.round(used, decimals);
    const fixedPending = _.round(pending, decimals);
    const fixedAvailable = _.round(available, decimals);
    const fixedRemaining = fixedAvailable - fixedUsed - fixedPending;
    const data = getData(fixedUsed, fixedPending, fixedRemaining);

    return (
        <div className='charts_donut'>
            <ChartistGraph data={{series: data}} options={options} type='Pie' />
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

function getData(used, pending, remaining) {
    // If there's a negative amount remaining, show an all red chart
    if (remaining < 0) return [0, 1, 0];

    // If there's no data, show an all grey chart
    if (!used && !pending && !remaining) return [0, 0, 1];

    return [used, pending, remaining];
}
