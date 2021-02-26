import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import Base from '../components/base';


const {hostname} = window.location;
const isDev = process.env.NODE_ENV !== 'production';
const BASE_HTTP_URL = isDev && hostname === 'localhost' ? 'http://localhost:57008' : '';
const GRAPH_QUERIES = [
    'instance:node_cpu:ratio',
    'instance:node_memory_utilisation:ratio',
];


type Props = {

}

type State = {
    metric: string;
    data: Map<string, Array<Array<any>>>;
}

export default class PrometheusGraph extends Base<Props, State> {
    componentDidMount() {
        // TODO: use proxy if ready
        const url = `${BASE_HTTP_URL}/api/v1/query_range`;
        this.setState((prevState => ({
            ...prevState,
            data: new Map(),
        })));
        for (let i = 0; i < GRAPH_QUERIES.length; i++) {
            const query = GRAPH_QUERIES[i];
            const params = {
                query,
                start: (Date.now() / 1000 - 60 * 60).toString(),
                end: (Date.now() / 1000).toString(), // One hour range
                step: '1',
            };
            fetch(`${url}?${new URLSearchParams(params).toString()}`)
                .then(result => result.json())
                .then((json) => {
                    const jsonData = json.data;
                    const graphData : Array<Array<any>> = jsonData.result[0].values.map((value: any) => ({x: value[0], y: +value[1]}));
                    this.state.data.set(query, graphData);
                    this.setState(prevState => ({
                        ...prevState,
                    }));
                });
        }
    }

    render() {
        return <div>
            {this.state?.data && GRAPH_QUERIES.map((value) => {
                if (!this.state.data.get(value)) {
                    return <div>Pending...</div>;
                }
                return this.state.data.get(value)
                    && <div style={{marginLeft: '36px'}}>
                        <span>${value}</span>
                        <XYPlot
                            yPadding={60}
                            width={600}
                            height={600}
                            xType="time">
                            <HorizontalGridLines />
                            <LineSeries
                                data={this.state.data.get(value)}
                                onNearestXY={datapoint => (
                                    <div style={{background: 'black'}}>
                                        {datapoint.x} <br/>
                                        {datapoint.y}
                                    </div>
                                )}
                            />
                            <XAxis
                                tickFormat={function tickFormat(d) {
                                    const date = new Date(d * 1000);
                                    return date.toLocaleTimeString();
                                }}
                                tickLabelAngle={30}
                            />
                            <YAxis
                                tickFormat={function tickFormet(d) {
                                    return `${(d * 100).toFixed(2)}%`;
                                }}
                                tickLabelAngle={30}
                                marginLeft={50}
                            />
                        </XYPlot>
                    </div>;
            })}

        </div>;
    }
}
