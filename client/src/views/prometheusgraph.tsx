import React from 'react';
import Base from '../components/base';


const {hostname} = window.location;
const isDev = process.env.NODE_ENV !== 'production';
const BASE_HTTP_URL = isDev && hostname === 'localhost' ? 'http://localhost:50642' : '';
const GRAPH_QUERIES = [
    'instance:node_cpu:ratio',
];


type Props = {

}

type State = {
    metric: string;
    result: string;
    values: Array<Array<string>>;
}

export default class PrometheusGraph extends Base<Props, State> {
    componentDidMount() {
        // TODO: use proxy if ready
        const url = `${BASE_HTTP_URL}/api/v1/query_range`;
        for (let i = 0; i < GRAPH_QUERIES.length; i++) {
            const query = GRAPH_QUERIES[i];
            const params = {
                query,
                start: (Date.now() / 1000).toString(),
                end: (Date.now() / 1000 + 60 * 60).toString(), // One hour range
                step: '1',
            };
            fetch(`${url}?${new URLSearchParams(params).toString()}`).then((result) => {
                console.log(result);
                // @ts-ignore
                this.setState(prevState => ({
                    ...prevState,
                    result,
                }));
            });
        }
    }

    render() {
        return <div>
            <div>{this.state?.result && (this.state?.result)}</div>
        </div>;
    }
}
