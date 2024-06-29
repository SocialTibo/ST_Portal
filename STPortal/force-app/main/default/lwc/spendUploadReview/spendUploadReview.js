import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadReview extends LightningElement {
    @track validatedRecords = [];
    @track abnErrors = [];
    @track categoryErrors = [];
    @track amountErrors = [];
    @track currentStep = 'step0';
    @track showModal = false;

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
            if (this.pageRef.state.step) {
                this.currentStep = this.pageRef.state.step;
            }
        }
        console.log('Connected callback - validatedRecords: ', JSON.stringify(this.validatedRecords));
    }

    get step0Visible() {
        return this.currentStep === 'step0';
    }

    get step1Visible() {
        return this.currentStep === 'step1';
    }

    get step2Visible() {
        return this.currentStep === 'step2';
    }

    get step3Visible() {
        return this.currentStep === 'step3';
    }

    get step4Visible() {
        return this.currentStep === 'step4';
    }

    handleStepChange(event) {
        this.currentStep = event.detail;
        console.log('handleStepChange - currentStep: ', this.currentStep);
    }

    handleValidatedRecordsChange(event) {
        const newValidatedRecords = event.detail;
        this.validatedRecords = [...this.validatedRecords, ...newValidatedRecords];
        console.log('handleValidatedRecordsChange - validatedRecords: ', JSON.stringify(this.validatedRecords));
    }

    handleSuggestion() {
        console.log('handleSuggestion called');
        this.showModal = true;
    }

    handleModalClose() {
        console.log('handleModalClose called');
        this.showModal = false;
    }

    handleModalSubmit(event) {
        const { supplierName, supplierABN, supplierContact } = event.detail;
        console.log('Suggested Supplier:', supplierName, supplierABN, supplierContact);
        this.handleModalClose();
    }
}
