import './editorModal.scss';
import React from 'react';
import Modal from 'react-modal';
import yml from 'yaml';
import Base from '../components/base';
import Button from '../components/button';
import Doc from '../components/doc';
import getDocDefinitions from '../services/docs';
import LightBulbSvg from '../art/lightBulbSvg';
import EditSvg from '../art/editSvg';
import {ApiItem, TODO} from '../utils/types';

interface Props<T extends ApiItem<any, any>> {
    body?: T;
    onSave: (item: T) => Promise<boolean>;
    onRequestClose: () => void;
}

type State = {
    showDocs: boolean;
    yaml?: string;
    properties?: TODO;
}

export default class EditorModal<T extends ApiItem<any, any>> extends Base<Props<T>, State> {
    state: State = {
        showDocs: false,
    };

    async componentDidMount() {
        this.findDocs(this.props.body);
    }

    async onEdit(yaml: string) {
        this.setState({yaml});

        try {
            const body = yml.parse(yaml, {indent: 2, schema: 'core'});
            this.findDocs(body);
        } catch (err) {
            // Do nothing here. The current yaml can't be parsed
        }
    }

    async save() {
        const {onSave} = this.props;
        const {yaml = ''} = this.state;

        const json = yml.parse(yaml, {indent: 2, schema: 'core'});
        const shouldClose = await onSave(json);

        if (shouldClose) this.close();
    }

    async findDocs(body?: T) {
        if (!body || !body.apiVersion || !body.kind) return;

        const result: TODO = await getDocDefinitions(body.apiVersion, body.kind);
        if (!result) return;

        this.setState({properties: result.properties});
    }

    close() {
        const {onRequestClose} = this.props;

        // To prevent the following React warning:
        // "Warning: Can't perform a React state update on an unmounted component."
        setTimeout(() => onRequestClose(), 0);
    }

    render() {
        const {yaml, properties, showDocs} = this.state || {};
        const {body} = this.props;

        const defaultYaml = body && yml.stringify(body, {indent: 2, schema: 'core'});

        return (
            <Modal isOpen={true} className='modal_modal' overlayClassName='modal_overlay' onRequestClose={() => this.close()}>
                <div className='editorModal'>
                    <div className='editorModal_edit'>
                        <textarea
                            hidden={showDocs}
                            className='editorModal_input'
                            defaultValue={defaultYaml}
                            placeholder="Enter some yaml here, y'all..."
                            onChange={x => this.onEdit(x.target.value)}
                            spellCheck='false'
                        />

                        <div hidden={!showDocs} className='editorModal_docs'>
                            {properties ? (
                                <Doc properties={properties} />
                            ) : (
                                <div className='editorModal_noDocs'>
                                    <h3>No Docs Found</h3>
                                    <div>
                                        Please enter yaml that includes an &quot;api version&quot;
                                        and &quot;kind&quot; to display help. For example
                                    </div>
                                    <pre>kind: ConfigMap</pre>
                                    <pre>apiVersion: v1</pre>
                                </div>
                            )}
                        </div>

                        <div className='modal_actions'>
                            <Button className='button_clear' onClick={() => this.setState(x => ({showDocs: !x.showDocs}))}>
                                {showDocs ? <EditSvg /> : <LightBulbSvg />}
                                <span className='button_label'>
                                    {showDocs ? 'Edit' : 'View Docs'}
                                </span>
                            </Button>
                            <div className='editorModal_spacer'></div>
                            <Button disabled={!yaml} className='button' onClick={() => this.save()}>Save</Button>
                            <Button className='button_negative' onClick={() => this.close()}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

// function yaml2js(allowArrays, yaml) {
//     if (!allowArrays) return yamljs.parse(yaml);

//     return yaml
//         .split('---')
//         .filter(Boolean)
//         .map(yamljs.parse);
// }
