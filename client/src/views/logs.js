import './logs.scss';
import _ from 'lodash';
import React from 'react';
import Switch from 'react-switch';
import Base from '../components/base';
import InputFilter from '../components/inputFilter';
import Loading from '../components/loading';
import api from '../services/api';

export default class Logs extends Base {
    state = {
        showPrevious: false,
        items: [],
    };

    constructor() {
        super();

        // From the lodash docs: "If leading and trailing options are true, func is invoked
        // on the trailing edge of the timeout only if the debounced function is invoked more
        // than once during the wait timeout."
        const options = {leading: true, trailing: true, maxWait: 500};
        this.debouncedRefreshLogs = _.debounce(this.refreshLogs.bind(this), 500, options);
    }

    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: api.pod.get(namespace, name, x => this.onPod(x)),
        });
    }

    onPod(pod) {
        const containers = pod.spec.containers.map(x => x.name);
        this.setState({containers});
        this.setContainer(containers[0]);
    }

    setContainer(container) {
        if (this.state.container === container) return;
        this.startLogsStream(container, this.state.showPrevious);
    }

    setShowPrevious(showPrevious) {
        if (this.state.showPrevious === showPrevious) return;
        this.startLogsStream(this.state.container, showPrevious);
    }

    startLogsStream(container, showPrevious) {
        if (!container) return;

        const {namespace, name} = this.props;
        this.setState({container, showPrevious, items: []});

        this.registerApi({
            items: api.logs(namespace, name, container, showPrevious, items => this.onLogs(items)),
        });
    }

    onLogs(log) {
        const {items} = this.state;
        items.push(log);
        this.debouncedRefreshLogs(items);
    }

    refreshLogs(logs) {
        const items = logs.slice(-2000);
        this.setState({items});
    }

    render() {
        const {namespace, name} = this.props;
        const {items, container, containers, filter = '', showPrevious = false} = this.state || {};

        const lowercaseFilter = filter.toLowerCase();
        const filteredLogs = items.filter(x => x.toLowerCase().includes(lowercaseFilter));

        return (
            <div id='content'>
                <div id='header'>
                    <span className='header_label'>{['Pod Logs', namespace, name].join(' • ')}</span>

                    <select
                        value={container}
                        className='select_namespace'
                        onChange={x => this.setContainer(x.target.value)}
                    >
                        {containers && containers.map(x => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>

                    <label className='logs_showPrevious'>
                        <Switch
                            checked={showPrevious}
                            onChange={x => this.setShowPrevious(x)}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            width={20}
                            height={10}
                        />
                        <div className='logs_showPreviouslabel'>Previous</div>
                    </label>

                    <InputFilter
                        filter={filter}
                        onChange={x => this.setState({filter: x})}
                    />

                </div>

                <div className='contentPanel'>
                    {!items ? <Loading /> : (
                        <pre>
                            {filteredLogs.join('')}
                        </pre>
                    )}
                </div>
            </div>
        );
    }
}
