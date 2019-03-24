import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import {parseCpu, parseRam} from '../utils/unitHelpers';
import Chart from '../components/chart';
import {defaultSortInfo} from '../components/sorter';

export default class Node extends Base {
    state = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
    };

    componentDidMount() {
        const {name} = this.props;

        this.registerApi({
            item: api.node.get(name, item => this.setState({item})),
            pods: api.pod.list(null, pods => this.setState({pods})),
            metrics: api.metrics.node(name, metrics => this.setState({metrics})),
            podMetrics: api.metrics.pods(null, (x) => {
                const podMetrics = _.keyBy(x, 'metadata.name');
                this.setState({podMetrics});
            }),
        });
    }

    render() {
        const {name} = this.props;
        const {item, pods, metrics, podMetrics, podsSort} = this.state;

        const filteredPods = pods && pods.filter(x => x.spec.nodeName === name);

        const usedCpu = metrics && parseCpu(metrics.usage.cpu) / 1000000;
        const availableCpu = item && parseCpu(item.status.capacity.cpu) / 1000000;

        const oneGb = 1024 * 1024 * 1024;
        const usedRam = metrics && parseRam(metrics.usage.memory) / oneGb;
        const availableRam = item && parseRam(item.status.capacity.memory) / oneGb;

        return (
            <div id='content'>
                <ItemHeader title={['Node', name]} />

                <div className='charts'>
                    <div className='charts_item'>
                        <div>{filteredPods && filteredPods.length}</div>
                        <div className='charts_itemLabel'>Pods</div>
                    </div>
                    <div className='charts_item'>
                        <Chart
                            used={usedCpu}
                            usedSuffix='m'
                            available={availableCpu}
                            availableSuffix='m'
                        />
                        <div className='charts_itemLabel'>Cpu Used</div>
                    </div>
                    <div className='charts_item'>
                        <Chart
                            used={usedRam}
                            usedSuffix='Gi'
                            available={availableRam}
                            availableSuffix='Gi'
                        />
                        <div className='charts_itemLabel'>Ram Used</div>
                    </div>
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                        </div>
                    )}
                </div>

                <PodsPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={podMetrics}
                    skipNodeName={true}
                />
            </div>
        );
    }
}
