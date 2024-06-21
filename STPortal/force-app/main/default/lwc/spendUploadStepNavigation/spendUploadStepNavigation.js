import { LightningElement, api } from 'lwc';

export default class SpendUploadStepNavigation extends LightningElement {
    @api currentStep;

    get currentStepLabel() {
        switch (this.currentStep) {
            case 'step1':
                return 'Upload File';
            case 'step2':
                return 'Review ABN';
            case 'step3':
                return 'Review Category';
            case 'step4':
                return 'Submit';
            default:
                return 'Upload File';
        }
    }
}
