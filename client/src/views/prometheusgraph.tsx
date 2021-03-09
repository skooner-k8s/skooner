import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import Base from '../components/base';


const BASE_HTTP_URL = 'http://localhost:4654/prom';
const GRAPH_QUERIES = [
    ['instance:node_cpu:ratio', 'Node CPU Usage'],
    ['instance:node_memory_utilisation:ratio', 'Node Memory Usage'],
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
            const query = GRAPH_QUERIES[i][0];
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
                    const graphData : Array<Array<any>> = jsonData.result[0]?.values.map((value: any) => ({x: value[0], y: +value[1]}));
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
                const query = value[0];
                const title = value[1];
                if (!this.state.data.get(query)) {
                    return <div>
                        <span style={{fontWeight: 'bold'}}>{title}</span>
                        <div>Pending...</div>
                    </div>;
                }
                return this.state.data.get(query)
                    && <div>
                        <div style={{fontWeight: 'bold'}}>{title}</div>
                        <XYPlot
                            yPadding={60}
                            width={600}
                            height={600}
                            xType="time">
                            <HorizontalGridLines />
                            <LineSeries
                                data={this.state.data.get(query)}
                            />
                            <XAxis
                                tickFormat={function tickFormat(d) {
                                    const date = new Date(d * 1000);
                                    return date.toLocaleTimeString();
                                }}
                                tickLabelAngle={30}
                                tickTotal={5}
                            />
                            <YAxis
                                tickFormat={function tickFormet(d) {
                                    return `${(d * 100).toFixed(2)}%`;
                                }}
                                tickLabelAngle={30}
                                tickPadding={-5}
                            />
                        </XYPlot>
                    </div>;
            })}

        </div>;
    }
}
