import React from 'react';
import PrometheusGraph from './prometheusgraph';
import Base from '../components/base';


type Props = {

}

type State = {
    metric: string;
    data: Map<string, Array<Array<any>>>;
    crosshairValues: [];
}

export default class PrometheusGraphs extends Base<Props, State> {
    // GRAPH_QUERIES = [
    //     ['instance:node_cpu:ratio', 'Node CPU Usage'],
    //     ['instance:node_memory_utilisation:ratio', 'Node Memory Usage'],
    // ];
    GRAPH_QUERIES = [
        {
            queryString: 'instance:node_cpu:ratio',
            title: 'Node CPU Usage',
        },
        {
            queryString: 'instance:node_memory_utilisation:ratio',
            title: 'Node Memory Usage',
        },
    ]

    render() {
        return <div>
            {/* eslint-disable-next-line react/jsx-key */}
            {this.GRAPH_QUERIES.map(query => <PrometheusGraph
                queryString={query.queryString}
                title={query.title}
            />)}
        </div>;
    }
}
