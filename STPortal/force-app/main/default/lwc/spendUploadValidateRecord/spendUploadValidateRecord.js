import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import insertSpendAllRecords from '@salesforce/apex/SpendService.insertSpendAllRecords';

export default class SpendUploadValidateRecord extends LightningElement {
    @api validatedRecords;

    handleSubmit() {
        console.log('Validated Records:', JSON.stringify(this.validatedRecords));

        insertSpendAllRecords({ validRecords: this.validatedRecords })
            .then(() => {
                this.showToast('Success', 'Records inserted successfully', 'success');
                // Additional logic after successful insertion, e.g., navigate to another page
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
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