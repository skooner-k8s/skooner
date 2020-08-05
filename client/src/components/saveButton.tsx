import React from 'react';
import Base from './base';
import Button from './button';
import EditorModal from '../views/editorModal';
import EditSvg from '../art/editSvg';

interface SaveButtonProps {
    onSave: Function
    item: {}
}

interface SaveButtonStates {
    showEditor: boolean;
}

export default class SaveButton extends Base<SaveButtonProps, SaveButtonStates> {
    render() {
        const {onSave, item} = this.props;
        const {showEditor = null} = this.state || {};

        return (
            <>
                <Button title='Edit' className='button_headerAction' onClick={() => this.setState({showEditor: true})}>
                    <EditSvg />
                    <span className='button_label'>Edit</span>
                </Button>

                {showEditor && (
                    <EditorModal
                        body={item}
                        onSave={onSave}
                        onRequestClose={() => this.setState({showEditor: false})}
                    />
                )}
            </>
        );
    }
}
