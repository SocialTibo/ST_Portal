import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class SpendSuggestSupplierModal extends LightningModal {
    @api content;

    handleOkay() {
        this.close('okay');
    }
    handleCancel(){
        console.log('cancel')
    }
}
