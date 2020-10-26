import 'xterm/dist/xterm.css';
import React from 'react';
import Select from 'react-select';
import {Terminal} from 'xterm';
import Base from '../components/base';
import api from '../services/api';
import {Pod, TODO} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    pod?: Pod;
    containers?: string[];
    container?: string;
}

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

export default class Exec extends Base<Props, State> {
    private socket?: WebSocket;

    private xterm?: Terminal;

    private xtermRef?: HTMLDivElement;

    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            pod: api.pod.get(namespace, name, x => this.onPod(x)),
        });
    }

    onPod(pod: Pod) {
        const containers = pod.spec.containers.map(x => x.name);
        this.setState({containers});
        this.setContainer(containers[0]);
    }

    setContainer(container: string) {
        if (this.state.container === container) return;
        this.setState({container});

        const {namespace, name} = this.props;
        const exec = api.exec(namespace, name, container, items => this.onData(items));

        this.socket = exec.getSocket(); // TODO: this won't work if the socket fails
        this.registerApi({cancel: exec.cancel});

        if (this.xterm) this.xterm.reset();
    }

    onData(bytes: TODO) {
        if (bytes.byteLength < 2 || !this.xterm) return;

        const data = bytes.slice(1); // Trim the first byte (indicates stderr, stdout, or stdin)
        const text = decoder.decode(data);
        this.xterm.write(text);
    }

    send(data: string) {
        if (!this.socket) return;

        const encoded = encoder.encode(data);
        // @ts-ignore
        const buffer = new Uint8Array([0, ...encoded]);
        this.socket.send(buffer);
    }

    onXTermRef(item: HTMLDivElement | null) {
        if (!item || this.xtermRef) return;

        const xterm = new Terminal();
        xterm.open(item);
        xterm.on('paste', x => this.send(x));
        xterm.on('key', (key, ev) => {
            const code = ev.keyCode === 13 ? '\n' : key;
            this.send(code);
        });

        this.xterm = xterm;
        this.xtermRef = item;
    }

    render() {
        const {namespace, name} = this.props;
        const {container, containers = []} = this.state || {};

        const options = containers.map(x => ({value: x, label: x}));
        const selected = options.find(x => x.value === container);

        return (
            <div id='content'>
                <div id='header'>
                    <span className='header_label'>{['Pod Exec', namespace, name].join(' • ')}</span>

                    <div className='select_namespace'>
                        <Select
                            className="react-select"
                            classNamePrefix="react-select"
                            value={selected}
                            options={options}
                            // @ts-ignore
                            onChange={x => this.setContainer(x.value)}
                        />
                    </div>
                </div>

                <div id='xterm' ref={x => this.onXTermRef(x)} className='contentPanel'>
                </div>
            </div>
        );
    }
}
