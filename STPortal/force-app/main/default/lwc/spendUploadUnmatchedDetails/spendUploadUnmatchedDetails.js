import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadUnmatchedDetails extends LightningElement {
    @track errorMessages = [];

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.amountErrors) {
            this.errorMessages = JSON.parse(this.pageRef.state.amountErrors);
            console.log('Amount Errors:', this.errorMessages); // Debugging information
        } else {
            console.log('No Amount Errors Found'); // Debugging information
        }
    }

    handleNext() {
        // Logic for handling the "Next" button click
    }
}
