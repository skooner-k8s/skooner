import React from 'react';
import Base from './base';
import Button from './button';
import {addUserConfirmation} from './notifier';
import DeleteSvg from '../art/deleteSvg';

type Props = {
    onDelete: () => void;
}

export default class DeleteButton extends Base<Props, {}> {
    render() {
        return (
            <Button title='Delete' className='button_headerAction' onClick={() => this.startDelete()}>
                <DeleteSvg />
                <span className='button_label'>Delete</span>
            </Button>
        );
    }

    startDelete() {
        const {onDelete} = this.props;
        const message = 'Are you sure you want to permanently delete this item?';

        addUserConfirmation(message, async (result) => {
            if (!result) return;

            await onDelete();
            window.history.back();
        });
    }
}
