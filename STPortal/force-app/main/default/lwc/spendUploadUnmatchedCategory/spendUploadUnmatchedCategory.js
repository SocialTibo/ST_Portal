import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadUnmatchedCategory extends LightningElement {
    @track errorMessages = [];

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.categoryErrors) {
            this.errorMessages = JSON.parse(this.pageRef.state.categoryErrors);
        }
    }
}
