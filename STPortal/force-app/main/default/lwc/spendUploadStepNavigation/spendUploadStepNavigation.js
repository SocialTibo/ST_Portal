import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

export default class SpendUploadStepNavigation extends NavigationMixin(LightningElement) {
    @api pageName;

    @wire(CurrentPageReference)
    pageRef;

    get currentStep() {
        console.log('current page reference:', this.pageRef);

        // Determine the pageName based on the page reference
        if (this.pageRef && this.pageRef.attributes) {
            this.pageName = this.pageRef.attributes.name;
        }

        console.log('page name: ' + this.pageName);

        switch (this.pageName) {
            case 'Upload_Spend__c':
                return 'Upload CSV';
            case 'unmatched_supplier__c':
                return 'Review Errors';
            case 'Final':
                return 'Confirm Upload';
            default:
                return 'Upload CSV';
        }
    }

    navigateToStep(step) {
        let pageName;
        switch (step) {
            case 'step1':
                pageName = 'Upload_Spend__c';
                break;
            case 'step2':
                pageName = 'unmatched_supplier__c';
                break;
            case 'step3':
                pageName = 'Final';
                break;
            default:
                pageName = 'Upload_Spend__c';
        }
        
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: pageName
            }
        });
    }

    handlePrevious() {
        switch (this.currentStep) {
            case 'step2':
                this.navigateToStep('step1');
                break;
            case 'step3':
                this.navigateToStep('step2');
                break;
            default:
                this.navigateToStep('step1');
        }
    }

    handleNext() {
        switch (this.currentStep) {
            case 'step1':
                this.navigateToStep('step2');
                break;
            case 'step2':
                this.navigateToStep('step3');
                break;
            default:
                this.navigateToStep('step1');
        }
    }

    handleStepBlur(event) {
        const stepIndex = event.detail.index;
        console.log('Step blur:', stepIndex);
    }

    handleStepFocus(event) {
        const stepIndex = event.detail.index;
        console.log('Step focus:', stepIndex);
    }

    handleMouseEnter(event) {
        const stepIndex = event.detail.index;
        console.log('Mouse enter:', stepIndex);
    }

    handleMouseLeave(event) {
        const stepIndex = event.detail.index;
        console.log('Mouse leave:', stepIndex);
    }
}