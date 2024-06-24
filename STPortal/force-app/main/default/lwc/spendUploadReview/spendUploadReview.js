import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadReview extends LightningElement {
    @track validatedRecords = [];
    @track abnErrors = [];
    @track categoryErrors = [];
    @track amountErrors = [];
    @track showAbnErrors = false;
    @track showCategoryErrors = false;
    @track showAmountErrors = false;
    @track currentStep = 'step1';

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
        this.showAbnErrors = this.currentStep === 'step1';
        this.showCategoryErrors = this.currentStep === 'step2';
        this.showAmountErrors = this.currentStep === 'step3';
    }
}
