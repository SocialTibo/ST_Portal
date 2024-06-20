import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadReview extends LightningElement {
    @track validatedRecords = [];
    @track abnErrors = [];
    @track categoryErrors = [];
    @track showCategoryErrors = false;
    @track showAbnErrors = true; // Initially show ABN errors

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state) {
            if (this.pageRef.state.validatedRecords) {
                this.validatedRecords = JSON.parse(this.pageRef.state.validatedRecords);
            }
            if (this.pageRef.state.abnErrors) {
                this.abnErrors = JSON.parse(this.pageRef.state.abnErrors);
            }
            if (this.pageRef.state.categoryErrors) {
                this.categoryErrors = JSON.parse(this.pageRef.state.categoryErrors);
            }
        }
    }

    get hasAbnErrors() {
        return this.abnErrors.length > 0;
    }

    handleShowCategoryErrors() {
        this.showCategoryErrors = true;
        this.showAbnErrors = false;
    }
}