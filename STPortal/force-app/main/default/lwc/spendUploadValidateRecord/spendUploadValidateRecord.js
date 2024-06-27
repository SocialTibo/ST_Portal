import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import insertSpendAllRecords from '@salesforce/apex/SpendService.insertSpendAllRecords';

export default class SpendUploadValidateRecord extends LightningElement {
    @api validatedRecords;

    handleSubmit() {
        console.log('Validated Records before insert:', JSON.stringify(this.validatedRecords));

        insertSpendAllRecords({ validRecords: this.validatedRecords })
            .then(() => {
                this.showToast('Success', 'Records inserted successfully', 'success');
                console.log('Records inserted successfully');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                console.error('Error inserting records:', JSON.stringify(error));
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}
