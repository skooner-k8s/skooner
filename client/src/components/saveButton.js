import React from 'react';
import Base from './base';
import Button from './button';
import EditorModal from '../views/editorModal';
import EditSvg from '../art/editSvg';

export default class SaveButton extends Base {
    render() {
        const {onSave, item} = this.props;
        const {showEditor} = this.state || {};

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
