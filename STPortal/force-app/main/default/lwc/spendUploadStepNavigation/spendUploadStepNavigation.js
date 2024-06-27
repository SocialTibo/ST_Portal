import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SpendUploadStepNavigation extends NavigationMixin(LightningElement) {
    @api currentStep = 'step0';
    @api abnErrors = [];
    @api categoryErrors = [];
    @api amountErrors = [];

    get currentStepLabel() {
        switch (this.currentStep) {
            case 'step0':
                return 'Upload Spend';
            case 'step1':
                return 'Review ABN';
            case 'step2':
                return 'Review Category';
            case 'step3':
                return 'Invalid / Incomplete Details';
            case 'step4':
                return 'Submit';
            default:
                return 'Upload Spend';
        }
    }

    get showPreviousButton() {
        return this.currentStep !== 'step0';
    }

    get showNextButton() {
        return this.currentStep !== 'step4';
    }

    get showReviewABNStep() {
        return this.abnErrors.length > 0;
    }

    get showReviewCategoryStep() {
        return this.categoryErrors.length > 0;
    }

    get showInvalidDetailsStep() {
        return this.amountErrors.length > 0;
    }

    handlePrevious() {
        const steps = this.getSteps();
        const currentIndex = steps.indexOf(this.currentStep);

        if (currentIndex > 0) {
            // Check if there is a previous visible step
            const previousStep = steps[currentIndex - 1];
            if (previousStep === 'step0' || !this.isStepVisible(previousStep)) {
                // Navigate back to the upload page
                this.navigateToUploadPage();
            } else {
                this.currentStep = previousStep;
                this.dispatchStepChangeEvent();
            }
        } else {
            this.navigateToUploadPage();
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
        const steps = ['step0', 'step1', 'step2', 'step3', 'step4'];
        if (this.abnErrors.length === 0) steps.splice(steps.indexOf('step1'), 1);
        if (this.categoryErrors.length === 0) steps.splice(steps.indexOf('step2'), 1);
        if (this.amountErrors.length === 0) steps.splice(steps.indexOf('step3'), 1);
        return steps;
    }

    isStepVisible(step) {
        switch (step) {
            case 'step1':
                return this.abnErrors.length > 0;
            case 'step2':
                return this.categoryErrors.length > 0;
            case 'step3':
                return this.amountErrors.length > 0;
            default:
                return false;
        }
    }

    navigateToUploadPage() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Upload_Spend__c'
            }
        });
    }

    dispatchStepChangeEvent() {
        const event = new CustomEvent('stepchange', {
            detail: this.currentStep
        });
        this.dispatchEvent(event);
    }
}
