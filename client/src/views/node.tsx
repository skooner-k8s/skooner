import _ from 'lodash';
import React from 'react';
import fromNow from '../utils/dates';
import api from '../services/api';
import Base from '../components/base';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import LoadingChart from '../components/loadingChart';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import Field from '../components/field';
import ChartsContainer from '../components/chartsContainer';
import NodeCpuChart from '../components/nodeCpuChart';
import NodeRamChart from '../components/nodeRamChart';
import PodStatusChart from '../components/podStatusChart';
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import getMetrics from '../utils/metricsHelpers';
import {Node, Pod, Metrics, TODO} from '../utils/types';

type Props = {
    name: string;
}

type State = {
    podsSort: SortInfo;
    item?: Node;
    metrics?: Metrics[];
    pods?: Pod[];
    podMetrics?: Metrics[];
}

export default class NodeView extends Base<Props, State> {
    state: State = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
    };

    componentDidMount() {
        const {name} = this.props;

        this.registerApi({
            item: api.node.get(name, item => this.setState({item})),
            metrics: api.metrics.node(name, metrics => this.setState({metrics})),
            pods: api.pod.list(undefined, pods => this.setState({pods})),
            podMetrics: api.metrics.pods(undefined, podMetrics => this.setState({podMetrics})),
        });
    }

    render() {
        const {name} = this.props;
        const {item, pods, metrics, podMetrics, podsSort} = this.state;

        const filteredPods = pods && pods.filter(x => x.spec.nodeName === name);
        const filteredPodMetrics = getMetrics(filteredPods, podMetrics);

        return (
            <div id='content'>
                <ItemHeader title={['Node', name]} />

                <ChartsContainer>
                    <div className='charts_item'>
                        {item && item.status ? (
                            <span className='charts_number'>{getUptime(item)}</span>
                        ) : (
                            <LoadingChart />
                        )}
                        <div className='charts_itemLabel'>Uptime</div>
                    </div>

                    {/*
                    // @ts-ignore */}
                    <NodeCpuChart items={item && [item]} metrics={metrics && [metrics]} />

                    {/*
                    // @ts-ignore */}
                    <NodeRamChart items={item && [item]} metrics={metrics && [metrics]} />
                </ChartsContainer>

                <ChartsContainer>
                    <PodStatusChart items={filteredPods} />
                    <PodCpuChart items={filteredPods} metrics={filteredPodMetrics} />
                    <PodRamChart items={filteredPods} metrics={filteredPodMetrics} />
                </ChartsContainer>

                <div className='contentPanel'>
                    {!item && <Loading />}
                    {item && item.status ? (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Kernel Version' value={item.status.nodeInfo.kernelVersion} />
                            <Field name='OS Image' value={item.status.nodeInfo.osImage} />
                            <Field name='OS' value={item.status.nodeInfo.operatingSystem} />
                            <Field name='Architecture' value={item.status.nodeInfo.architecture} />
                            <Field name='Container Runtime' value={item.status.nodeInfo.containerRuntimeVersion} />
                            <Field name='Kubelet' value={item.status.nodeInfo.kubeletVersion} />
                            <Field name='Kube Proxy' value={item.status.nodeInfo.kubeProxyVersion} />
                            <Field name='Taints'>{getTaints(item)}</Field>
                        </div>
                    ) : null}
                </div>

                <div className='contentPanel_header'>Conditions</div>
                <div className='contentPanel'>
                    {!item && <Loading />}
                    {item && item.status ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Condition</th>
                                    <th>Status</th>
                                    <th className='optional_medium'>Transition</th>
                                    <th className='optional_small'>Reason</th>
                                    <th className='optional_small'>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {_.map(item.status.conditions, x => (
                                    <tr key={x.type}>
                                        <td>{x.type}</td>
                                        <td>{x.status}</td>
                                        <td className='optional_medium'>{fromNow(x.lastTransitionTime)}</td>
                                        <td className='optional_small'>{x.reason}</td>
                                        <td className='optional_small'>{x.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                </div>

                <div className='contentPanel_header'>Pods</div>
                <PodsPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={filteredPodMetrics}
                />
            </div>
        );
    }
}


function getTaints({spec}: Node) {
    return _.map(spec.taints, ({key, effect}: TODO) => (
        <div key={key}> <span>{key}</span> • <span title={key}> {effect} </span></div>
    ));
}

function getUptime({status}: Node) {
    const ready = status.conditions.find(y => y.type === 'Ready');
    if (!ready) return 'N/A';

    return fromNow(ready.lastTransitionTime);
}
