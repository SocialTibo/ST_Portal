import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadReview extends LightningElement {
    @track validatedRecords = [];
    @track abnErrors = [];
    @track categoryErrors = [];
    @track amountErrors = [];
    @track showCategoryErrors = false;
    @track showAbnErrors = true; // Initially show ABN errors
    @track showAmountErrors = false;

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
            if (this.pageRef.state.amountErrors) {
                this.amountErrors = JSON.parse(this.pageRef.state.amountErrors);
            }
        }
    }

    get currentStep() {
        if (this.showAbnErrors) {
            return 'step2'; // Review ABN
        } else if (this.showCategoryErrors) {
            return 'step3'; // Review Category
        } else if (this.showAmountErrors) {
            return 'step4'; // Invalid / Incomplete Details
        } else {
            return 'step5'; // Submit
        }
    }

    handleShowCategoryErrors() {
        this.showCategoryErrors = true;
        this.showAbnErrors = false;
    }

    handleShowAmountErrors() {
        this.showAmountErrors = true;
        this.showCategoryErrors = false;
        this.showAbnErrors = false;
    }

    handleSubmit() {
        // Logic for handling the submission of validated records
        // e.g., call an Apex method to insert the records
    }
}
