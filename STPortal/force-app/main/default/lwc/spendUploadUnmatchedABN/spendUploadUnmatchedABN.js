import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadUnmatchedABN extends LightningElement {
    @track errorMessages = [];

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.abnErrors) {
            this.errorMessages = JSON.parse(this.pageRef.state.abnErrors);
        }
    }

    
}
