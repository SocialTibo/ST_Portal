import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SpendUploadStepNavigation extends NavigationMixin(LightningElement) {
    @api currentStep = 'step1';
    @api abnErrors = [];
    @api categoryErrors = [];
    @api amountErrors = [];

    get currentStepLabel() {
        switch (this.currentStep) {
            case 'step1':
                return 'Review ABN';
            case 'step2':
                return 'Review Category';
            case 'step3':
                return 'Invalid / Incomplete Details';
            case 'step4':
                return 'Submit';
            default:
                return 'Review ABN';
        }
    }

    handlePrevious() {
        const steps = this.getSteps();
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
            this.dispatchStepChangeEvent();
        } else if (this.currentStep === 'step1') {
            // Navigate back to the upload page
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Upload_Spend__c'
                }
            });
        }
    }

    handleNext() {
        const steps = this.getSteps();
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex < steps.length - 1) {
            this.currentStep = steps[currentIndex + 1];
            this.dispatchStepChangeEvent();
        }
    }

    getSteps() {
        const steps = ['step1', 'step2', 'step3', 'step4'];
        if (this.abnErrors.length === 0) steps.splice(steps.indexOf('step1'), 1);
        if (this.categoryErrors.length === 0) steps.splice(steps.indexOf('step2'), 1);
        if (this.amountErrors.length === 0) steps.splice(steps.indexOf('step3'), 1);
        return steps;
    }

    dispatchStepChangeEvent() {
        const event = new CustomEvent('stepchange', {
            detail: this.currentStep
        });
        this.dispatchEvent(event);
    }
}
