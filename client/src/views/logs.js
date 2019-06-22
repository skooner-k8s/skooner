import './logs.scss';
import _ from 'lodash';
import React from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import Ansi from 'ansi-to-react';
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
        const options = {leading: true, trailing: true, maxWait: 1000};
        this.debouncedSetState = _.debounce(this.setState.bind(this), 100, options);
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

        this.setState({container, showPrevious, items: []});

        const {namespace, name} = this.props;
        this.registerApi({
            items: api.logs(namespace, name, container, 1000, showPrevious, items => this.debouncedSetState({items})), // eslint-disable-line max-len
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {items, container, containers = [], filter = '', showPrevious = false} = this.state;

        const lowercaseFilter = filter.toLowerCase();
        const filteredLogs = items.filter(x => x.toLowerCase().includes(lowercaseFilter));

        const options = containers.map(x => ({value: x, label: x}));
        const selected = options.find(x => x.value === container);

        return (
            <div id='content'>
                <div id='header'>
                    <span className='header_label'>{['Pod Logs', namespace, name].join(' • ')}</span>

                    <div className='select_namespace'>
                        <Select
                            className="react-select"
                            classNamePrefix="react-select"
                            value={selected}
                            onChange={x => this.setContainer(x.value)}
                            options={options}
                        />
                    </div>

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
                            {filteredLogs.map((x, i) => (
                                <Ansi key={i}>{x}</Ansi>
                            ))}
                        </pre>
                    )}
                </div>
            </div>
        );
    }
}
