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
            this.errorMessages = this.errorMessages.map((error, index) => ({ 
                ...error, 
                showSearch: false, 
                searchResults: [],
                removed: false,
                corrected: false,
                errorClass: this.getErrorClass(error),
                labelClass: this.getLabelClass(error),
                key: index
            }));
        }
    }

    getErrorClass(error) {
        let errorClass = 'slds-box slds-m-bottom_small';
        if (error.removed) {
            errorClass += ' removed';
        } else if (error.corrected) {
            errorClass += ' corrected';
        } else {
            if (!error.Supplier) {
                errorClass += ' supplier-error';
            } else if (!error.ABN) {
                errorClass += ' abn-error';
            } else if (!error.Amount) {
                errorClass += ' amount-error';
            }
        }
        return errorClass;
    }

    getLabelClass(error) {
        return error.removed ? 'strikethrough' : '';
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
    }

    handleRemove(event) {
        const abn = event.target.dataset.id;
        // Mark the record as removed and change the text color
        this.errorMessages = this.errorMessages.map(error => {
            if (error.ABN === abn) {
                const updatedError = { ...error, removed: true };
                return { ...updatedError, errorClass: this.getErrorClass(updatedError), labelClass: this.getLabelClass(updatedError) };
            }
            return error;
        });
        // Ensure the removed record is not in validatedRecords
        this.validatedRecords = this.validatedRecords.filter(record => record.ABN__c !== abn);
        // Emit the validated records to the parent component
        this.dispatchEvent(new CustomEvent('validatedrecordschange', { detail: this.validatedRecords }));
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
    }

    handleResultClick(event) {
        const accountId = event.currentTarget.dataset.id;
        const accountName = event.currentTarget.dataset.name;
        const accountABN = event.currentTarget.dataset.accountAbn;
        const abn = event.currentTarget.dataset.abn;

        // Update the Supplier value in the corresponding error message
        this.errorMessages = this.errorMessages.map(error => {
            if (error.ABN === abn) {
                // Add corrected record to validatedRecords
                const updatedRecord = {
                    Amount__c: error.Amount,
                    Supplier__c: accountId,
                    ABN__c: accountABN,
                    Category__c: error.CategoryId, // Use CategoryId instead of name
                    Financial_Year__c: error['Financial Year']
                };
                this.validatedRecords = [...this.validatedRecords, updatedRecord];

                const updatedError = { ...error, Supplier: accountName, SupplierId: accountId, ABN: accountABN, corrected: true, showSearch: false, searchResults: [] };
                return { ...updatedError, errorClass: this.getErrorClass(updatedError), labelClass: '' };
            }
            return error;
        });

        // Emit the validated records to the parent component
        this.dispatchEvent(new CustomEvent('validatedrecordschange', { detail: this.validatedRecords }));

        // Log the updated error message
        console.log('Updated Error Messages: ', this.errorMessages);
        console.log('Validated Records: ', this.validatedRecords);
    }

    closeSearchResults() {
        this.showSearchResults = false;
    }
}
