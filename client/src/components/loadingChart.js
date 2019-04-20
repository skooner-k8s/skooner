import React from 'react';
import ChartistGraph from 'react-chartist';
import LoadingEllipsis from './loadingEllipsis';

const options = {
    donut: true,
    donutWidth: 25,
    donutSolid: true,
    startAngle: 0,
    showLabel: false,
};

export default function Chart() {
    return (
        <div className='charts_donut'>
            <ChartistGraph data={{series: [0, 0, 1]}} options={options} type='Pie' />
            <LoadingEllipsis />
        </div>
    );
}
