import _ from 'lodash';
import React from 'react';
import api from '../services/api';
import Base from '../components/base';
import Chart from '../components/chart';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import LoadingChart from '../components/loadingChart';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import {defaultSortInfo} from '../components/sorter';
import {parseCpu, parseRam, TO_GB, TO_ONE_M_CPU} from '../utils/unitHelpers';
import PodStatusChart from '../components/podStatusChart';

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

        return (
            <div id='content'>
                <ItemHeader title={['Node', name]} />

                <div className='charts'>
                    <PodStatusChart items={filteredPods} />
                    <CpuChart item={item} metrics={metrics} />
                    <RamChart item={item} metrics={metrics} />
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

function CpuChart({item, metrics}) {
    const usedCpu = metrics && parseCpu(metrics.usage.cpu) / TO_ONE_M_CPU;
    const availableCpu = item && parseCpu(item.status.capacity.cpu) / TO_ONE_M_CPU;

    return (
        <div className='charts_item'>
            {item && metrics ? (
                <Chart
                    used={usedCpu}
                    usedSuffix='m'
                    available={availableCpu}
                    availableSuffix='m'
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Cpu Used</div>
        </div>
    );
}

function RamChart({item, metrics}) {
    const usedRam = metrics && parseRam(metrics.usage.memory) / TO_GB;
    const availableRam = item && parseRam(item.status.capacity.memory) / TO_GB;

    return (
        <div className='charts_item'>
            {item && metrics ? (
                <Chart
                    used={usedRam}
                    usedSuffix='Gi'
                    available={availableRam}
                    availableSuffix='Gi'
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Ram Used</div>
        </div>
    )
}
