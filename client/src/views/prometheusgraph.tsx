import React from 'react';
import Base from '../components/base';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';


const {hostname} = window.location;
const isDev = process.env.NODE_ENV !== 'production';
const BASE_HTTP_URL = isDev && hostname === 'localhost' ? 'http://localhost:57008' : '';
const GRAPH_QUERIES = [
    'instance:node_cpu:ratio',
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
            data: new Map()
        })));
        for (let i = 0; i < GRAPH_QUERIES.length; i++) {
            const query = GRAPH_QUERIES[i];
            const params = {
                query,
                start: (Date.now() / 1000 - 60 * 60).toString(),
                end: (Date.now() / 1000 ).toString(), // One hour range
                step: '1',
            };
            fetch(`${url}?${new URLSearchParams(params).toString()}`)
                .then((result) => result.json())
                .then((json) => {
                    const json_data = json.data
                    const graph_data : Array<Array<any>> = json_data.result[0].values.map((value: any) => {
                        return {x: value[0], y: +value[1]}
                    })
                    this.state.data.set(query, graph_data);
                    this.setState((prevState) => ({
                        ...prevState
                    }));
                });
        }
    }

    render() {
        return <div>
            {this.state?.data && GRAPH_QUERIES.map((value, i) => {
                if (!this.state.data.get(value)) {
                    return <div>Pending...</div>
                }
                console.log(this.state.data)
                return this.state.data.get(value) &&
                    <div>
                        <XYPlot
                            width={600}
                            height={600}
                            xType="time">
                            <HorizontalGridLines />
                            <LineSeries
                                data={this.state.data.get(value)}/>
                            <XAxis
                                tickFormat={function tickFormat(d){
                                    const date = new Date(d*1000)
                                    return date.toLocaleTimeString()
                                }}
                                tickLabelAngle={30}
                            />
                            <YAxis
                                tickFormat={function tickFormet(d){
                                    return Math.round(d*100) + "%"
                                }}
                            />
                        </XYPlot>
                    </div>
            })}

        </div>;
    }
}
