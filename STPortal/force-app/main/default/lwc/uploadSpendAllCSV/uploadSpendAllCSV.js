import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import validateSpendAllRecords from '@salesforce/apex/SpendService.validateSpendAllRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import fileSelectorStyle from '@salesforce/resourceUrl/fileSelectorStyle';

export default class UploadSpendAllCSV extends NavigationMixin(LightningElement) {
    @track fileData;
    @track fileName;
    @track errorMessages = [];
    @track isLoading = false;
    @track validatedRecords = [];

    expectedHeaders = ['Buyer', 'ABN', 'Supplier', 'Amount', 'Financial Year', 'Category'];

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    connectedCallback() {
        Promise.all([
            loadStyle(this, fileSelectorStyle)
        ]);
    }

    handleFileUpload(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.fileName = file.name;
            const reader = new FileReader();

            reader.onload = () => {
                const csv = reader.result;
                this.fileData = csv;
                this.errorMessages = [];
            };

            reader.onerror = () => {
                this.showError([{ text: 'Error reading file', class: 'error' }]);
            };

            reader.readAsText(file);
        }
    }

    async importRecords() {
        if (!this.fileData) {
            this.showError([{ text: 'No file data found. Please upload a CSV file first.', class: 'error' }]);
            return;
        }

        this.isLoading = true;

        try {
            const rows = this.fileData.split('\n').filter(row => row.trim() !== '');
            const headers = rows[0].split(',').map(header => header.trim());

            if (!this.validateHeaders(headers)) {
                this.showError([
                    { text: 'Oops! You have too many columns or invalid columns', class: 'error-header' },
                    { text: `Your file has some columns we don't recognise. Please delete or rename your columns in your CSV file and try again. You can refer to our blank template.`, class: 'error-body' }
                ]);
                this.isLoading = false;
                return;
            }

            const spendAllRecords = rows.slice(1).map(row => {
                const values = row.split(',');
                const record = {};

                headers.forEach((header, index) => {
                    record[header] = values[index] ? values[index].trim() : '';
                });

                return record;
            });

            const validationResult = await validateSpendAllRecords({ spendAllRecords });

            this.validatedRecords = validationResult.validRecords;
            this.navigateToReviewPage(validationResult.abnErrors, validationResult.categoryErrors, validationResult.amountErrors);

        } catch (error) {
            this.showError([{ text: 'Error processing CSV data: ' + error.message, class: 'error' }]);
            console.error('Error processing CSV data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    validateHeaders(headers) {
        if (headers.length !== this.expectedHeaders.length) {
            return false;
        }

        for (let i = 0; i < headers.length; i++) {
            if (headers[i] !== this.expectedHeaders[i]) {
                return false;
            }
        }

        return true;
    }

    handleTryAgain() {
        this.errorMessages = [];
        this.fileData = null;
        this.fileName = null;
        this.validatedRecords = [];

        const fileInput = this.template.querySelector('lightning-input[type="file"]');
        if (fileInput) {
            fileInput.value = null;
        }
    }

    showError(messages) {
        this.errorMessages = messages;
        messages.forEach(message => this.showToast('Error', message.text, 'error'));
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }

    navigateToReviewPage(abnErrors, categoryErrors, amountErrors) {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'review__c'
            },
            state: {
                validatedRecords: JSON.stringify(this.validatedRecords),
                abnErrors: JSON.stringify(abnErrors),
                categoryErrors: JSON.stringify(categoryErrors),
                amountErrors: JSON.stringify(amountErrors),
                step: 'step1' 
            }
        });

        // Dispatch a custom event to move to step 1
        const event = new CustomEvent('stepchange', {
            detail: 'step1'
        });
        this.dispatchEvent(event);
    }
}
