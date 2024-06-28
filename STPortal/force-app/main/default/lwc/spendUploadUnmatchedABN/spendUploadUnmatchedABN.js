import { LightningElement, track, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import searchAccounts from '@salesforce/apex/SpendValidation.searchSupplierAccounts';

export default class SpendUploadUnmatchedABN extends LightningElement {
    @track errorMessages = [];
    @track searchResults = [];
    @track searchTerm = '';
    @track currentABN = '';
    @api validatedRecords = [];

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.abnErrors) {
            this.errorMessages = JSON.parse(this.pageRef.state.abnErrors);
            // Initialize the showSearch and searchResults property for each error message
            this.errorMessages = this.errorMessages.map(error => ({
                ...error,
                showSearch: false,
                searchResults: [],
                errorClass: this.getErrorClass(error)
            }));
        }
        console.log('Initial errorMessages: ', JSON.stringify(this.errorMessages));
        console.log('Initial validatedRecords: ', JSON.stringify(this.validatedRecords));
    }

    getErrorClass(error) {
        if (!error.Supplier) {
            return 'supplier-error';
        } else if (!error.ABN) {
            return 'abn-error';
        } else if (!error.Amount) {
            return 'amount-error';
        } else {
            return '';
        }
    }

    handleFindSupplier(event) {
        const abn = event.target.dataset.id;
        this.currentABN = abn;
        this.errorMessages = this.errorMessages.map(error => {
            if (error.ABN === abn) {
                return { ...error, showSearch: !error.showSearch };
            }
            return error;
        });
        console.log('handleFindSupplier - errorMessages: ', JSON.stringify(this.errorMessages));
    }

    handleSearch(event) {
        const searchTerm = event.target.value;
        const abn = event.target.dataset.id;

        if (searchTerm.length > 2) {
            searchAccounts({ searchTerm })
                .then(result => {
                    this.errorMessages = this.errorMessages.map(error => {
                        if (error.ABN === abn) {
                            return { ...error, searchResults: result };
                        }
                        return error;
                    });
                    console.log('handleSearch - searchResults: ', JSON.stringify(result));
                })
                .catch(error => {
                    console.error('Error searching accounts:', error);
                });
        } else {
            this.errorMessages = this.errorMessages.map(error => {
                if (error.ABN === abn) {
                    return { ...error, searchResults: [] };
                }
                return error;
            });
        }
        console.log('handleSearch - errorMessages: ', JSON.stringify(this.errorMessages));
    }

    handleResultClick(event) {
        const accountId = event.currentTarget.dataset.id;
        const accountName = event.currentTarget.dataset.name;
        const abn = event.currentTarget.dataset.abn;
        const accountAbn = event.currentTarget.dataset.accountAbn;

        // Update the Supplier value and ABN in the corresponding error message
        this.errorMessages = this.errorMessages.map(error => {
            if (error.ABN === abn) {
                // Add corrected record to validatedRecords
                const updatedRecord = {
                    Amount__c: error.Amount,
                    Supplier__c: accountId,
                    ABN__c: accountAbn,
                    Category__c: error.CategoryId, // Use CategoryId instead of name
                    Financial_Year__c: error['Financial Year']
                };
                this.validatedRecords = [...this.validatedRecords, updatedRecord];

                return { ...error, Supplier: accountName, ABN: accountAbn, SupplierId: accountId, corrected: true, showSearch: false, searchResults: [] };
            }
            return error;
        });

        // Emit the validated records to the parent component
        this.dispatchEvent(new CustomEvent('validatedrecordschange', { detail: this.validatedRecords }));

        // Log the updated error message
        console.log('Updated Error Messages: ', JSON.stringify(this.errorMessages));
        console.log('Validated Records: ', JSON.stringify(this.validatedRecords));
    }

    closeSearchResults() {
        this.showSearchResults = false;
    }
}
