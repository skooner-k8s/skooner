import './editorModal.scss';
import React from 'react';
import Modal from 'react-modal';
import yamljs from 'yamljs';
import Base from '../components/base';
import Button from '../components/button';

export default class EditorModal extends Base {
    constructor(props) {
        super(props);

        const body = props.body ? yamljs.stringify(props.body, 10) : undefined;
        this.state = {body};
    }

    async add() {
        const {onSave} = this.props;
        const {body = ''} = this.state;

        const json = yamljs.parse(body);
        const shouldClose = await onSave(json);

        if (shouldClose) this.close();
    }

    close() {
        const {onRequestClose} = this.props;

        // To prevent the following React warning:
        // "Warning: Can't perform a React state update on an unmounted component."
        setTimeout(() => onRequestClose(), 0);
    }

    render() {
        const {body} = this.state || {};

        return (
            <Modal isOpen={true} className='modal_modal' overlayClassName='modal_overlay' onRequestClose={() => this.close()}>
                <div>
                    <textarea
                        className='editorModal_input'
                        defaultValue={body}
                        placeholder="Enter some yaml here, y'all..."
                        onChange={x => this.setState({body: x.target.value})}
                        spellCheck='false'
                    />

                    <div className='modal_actions'>
                        <Button className='button' onClick={() => this.add()}>Save</Button>
                        <Button className='button button_negative' onClick={() => this.close()}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        );
    }
}
