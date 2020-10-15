import React from 'react';
import Base from './base';
import Button from './button';
import EditorModal from '../views/editorModal';
import EditSvg from '../art/editSvg';
import {ApiItem} from '../utils/types';

interface SaveButtonProps<T extends ApiItem<any, any>> {
    item?: T;
    onSave: (item: T) => Promise<boolean>;
}

interface SaveButtonStates {
    showEditor: boolean;
}

export default class SaveButton<T extends ApiItem<any, any>> extends Base<SaveButtonProps<T>, SaveButtonStates> {
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
