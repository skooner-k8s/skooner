import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, Crosshair, AreaSeries} from 'react-vis';
import Base from '../components/base';


const BASE_HTTP_URL = 'http://localhost:4654/prom';


type Props = {
    queryString: string;
    title: string;
}

type State = {
    metric: string;
    data: Array<any>;
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
        const url = `${BASE_HTTP_URL}/api/v1/query_range`;
        this.setState((prevState => ({
            ...prevState,
            data: new Array<any>(),
            crosshairValues: [],
        })));
        const params = {
            query: this.props.queryString,
            start: (Date.now() / 1000 - 60 * 60).toString(),
            end: (Date.now() / 1000).toString(), // One hour range
            step: '1',
        };
        fetch(`${url}?${new URLSearchParams(params).toString()}`)
            .then(result => result.json())
            .then((json) => {
                const jsonData = json.data;
                const graphData : Array<any> = jsonData.result[0]?.values.map((value: any) => ({x: value[0], y: +value[1]}));
                this.setState(prevState => ({
                    ...prevState,
                    data: graphData,
                }));
            });
    }

    render() {
        if (!this.state || !this.state.data) {
            return <div>
                {/* <span style={{fontWeight: 'bold'}}>{this.props.title}</span> */}
                <div>Pending...</div>
            </div>;
        }
        return this.state.data
            && <div>
                {/* <div style={{fontWeight: 'bold'}}>{this.props.title}</div> */}
                <XYPlot
                    yPadding={60}
                    width={150}
                    height={150}
                    xType="time"
                    onMouseLeave={this.onMouseLeave}>
                    <AreaSeries
                        color={'#6822aa'}
                        opacity={0.6}
                        data={this.state.data}
                    />
                    <HorizontalGridLines />
                    <LineSeries
                        data={this.state.data}
                        color={'#6822aa'}
                        onNearestX={this.onNearestX}
                    />
                    <Crosshair
                        values={this.state.crosshairValues}
                        itemsFormat={
                            d => [
                                {title: 'Time', value: new Date(d[0].x * 1000).toLocaleTimeString()},
                                {title: 'Percent', value: `${(d[0].y * 100).toFixed(2)}%`},
                            ]
                        }
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
                        tickFormat={function tickFormet(d) {
                            return `${(d * 100).toFixed(2)}%`;
                        }}
                        tickLabelAngle={0}
                        tickPadding={-5}
                    />
                </XYPlot>
            </div>;
    }
}
