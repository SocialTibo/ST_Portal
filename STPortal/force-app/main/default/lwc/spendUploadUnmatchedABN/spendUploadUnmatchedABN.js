import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import searchAccounts from '@salesforce/apex/SpendValidation.searchSupplierAccounts';

export default class SpendUploadUnmatchedABN extends LightningElement {
    @track errorMessages = [];
    @track searchResults = [];
    @track searchTerm = '';
    @track currentABN = '';

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.abnErrors) {
            this.errorMessages = JSON.parse(this.pageRef.state.abnErrors);
            // Initialize the showSearch and searchResults property for each error message
            this.errorMessages = this.errorMessages.map(error => ({ ...error, showSearch: false, searchResults: [] }));
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
        console.log('handleResultClick to change the CSV')
        const accountId = event.currentTarget.dataset.id;
        const accountName = event.currentTarget.dataset.name;
        const abn = event.currentTarget.dataset.abn;

        // Update the Supplier value in the corresponding error message
        this.errorMessages = this.errorMessages.map(error => {
            if (error.ABN === abn) {
                return { ...error, Supplier: accountName, showSearch: false, searchResults: [] };
            }
            return error;
        });
    }

    closeSearchResults() {
        this.showSearchResults = false;
    }
}
