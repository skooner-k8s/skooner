import React from 'react';
import {XYPlot, XAxis, YAxis, LineSeries, Crosshair, AreaSeries} from 'react-vis';
import Base from '../components/base';


export const BASE_HTTP_URL = 'http://localhost:50320';


type Props = {
    queryString: string;
    title: string;
    yAxisMin?: number;
    yAxisUnit?: string;
    prometheusData: Array<any>;
}

type State = {
    crosshairValues: any[];
}

export default class PrometheusGraph extends Base<Props, State> {
    /**
     * Event handler for onMouseLeave.
     * @private
     */
    onMouseLeave = () => {
        this.setState({crosshairValues: []});
    };

    /**
     * Event handler for onNearestX.
     * @param {Object} value Selected value.
     * @param {index} index Index of the value in the data array.
     * @private
     */
    onNearestX = (value: any, {index} : any) => {
        this.setState((prevState => ({
            ...prevState,
            crosshairValues: [value],
        })));
    };

    componentDidMount() {
        this.setState((prevState => ({
            ...prevState,
            data: this.props.prometheusData,
            crosshairValues: [],
        })));
    }

    getYDomain = () => {
        if (this.props.yAxisUnit) {
            // Taken from https://github.com/uber/react-vis/issues/609#issuecomment-330066354
            const {yMin, yMax} = this.props.prometheusData.reduce((acc, row) => ({
                yMax: Math.max(acc.yMax, row.y),
                yMin: Math.min(acc.yMin, row.y),
            }), {yMin: Infinity, yMax: -Infinity});
            return (typeof (this.props.yAxisMin) === 'number' ? [this.props.yAxisMin, yMax] : [yMin, yMax]);
        }
        return [0, 1];
    };

    getYTickFormat = () => {
        if (this.props.yAxisUnit) {
            return (d: number) => `${d} ${this.props.yAxisUnit}`;
        }
        return (d: number) => `${(d * 100).toFixed(0)}%`;
    };

    getItemsFormat = () => {
        if (this.props.yAxisUnit) {
            return (d: { y: number; }[]) => [{title: this.props.yAxisUnit, value: d[0].y}];
        }
        return (d: { y: number; }[]) => [{title: 'Percent', value: `${(d[0].y * 100).toFixed(2)}%`}];
    };

    render() {
        if (!this.state || !this.props.prometheusData) {
            return <div>
                {/* <span style={{fontWeight: 'bold'}}>{this.props.title}</span> */}
                <div>Pending...</div>
            </div>;
        }
        return this.state && this.props.prometheusData
            && <div>
                {/* <div style={{fontWeight: 'bold'}}>{this.props.title}</div> */}
                <XYPlot
                    margin={{left: 50}}
                    yPadding={60}
                    width={200}
                    height={150}
                    xType="time"
                    yDomain={this.getYDomain()}
                    onMouseLeave={this.onMouseLeave}>
                    <AreaSeries
                        color={'#6822aa'}
                        opacity={0.6}
                        data={this.props.prometheusData}
                    />
                    <LineSeries
                        data={this.props.prometheusData}
                        color={'#6822aa'}
                        onNearestX={this.onNearestX}
                    />
                    <Crosshair
                        values={this.state.crosshairValues}
                        titleFormat={
                            d => ({title: 'Time', value: new Date(d[0].x * 1000).toLocaleTimeString()})
                        }
                        itemsFormat={this.getItemsFormat()}
                        className={'test-class-name'}
                    />
                    <XAxis
                        tickFormat={function tickFormat(d) {
                            const date = new Date(d * 1000);
                            return date.toLocaleTimeString().slice(0, -6);
                        }}
                        tickPadding={5}
                        tickTotal={3}
                    />
                    <YAxis
                        tickFormat={this.getYTickFormat()}
                        tickLabelAngle={0}
                        tickPadding={-5}
                    />
                </XYPlot>
            </div>;
    }
}
