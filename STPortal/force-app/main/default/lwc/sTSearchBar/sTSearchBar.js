import { LightningElement, track } from 'lwc';
import getServiceLocationOptions from '@salesforce/apex/SPSearchBarCtrl.getServiceLocationOptions';
import getProductCategoryOptions from '@salesforce/apex/SPSearchBarCtrl.getProductCategoryOptions';

export default class stSearchBar extends LightningElement {
    @track searchKeyword = '';
    @track selectedServiceArea = 'All'; 
     @track selectedCategory = 'All';
    @track showSearchResults = false;

    @track serviceAreaOptions = [{ label: 'All', value: 'All' }]; 
    @track categoryOptions = [{ label: 'All', value: 'All' }]; 

    connectedCallback() {
        this.loadOptions();
    }

    // Trigger search on any key press
    keycheck(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    loadOptions() {
        getServiceLocationOptions()
            .then(result => {
                this.serviceAreaOptions = [{ label: 'All', value: 'All' }, ...result.map(option => ({ label: option.name, value: option.name }))];
            })
            .catch(error => {
                console.error('Error fetching service location options:', error);
            });

        getProductCategoryOptions()
            .then(result => {
                this.categoryOptions = [{ label: 'All', value: 'All' }, ...result.map(option => ({ label: option.name, value: option.name }))];
            })
            .catch(error => {
                console.error('Error fetching product category options:', error);
            });
    }

    handleSearchChange(event) {
        this.searchKeyword = event.target.value;
        this.dispatchSearchEvent();
    }

    handleServiceAreaChange(event) {
        this.selectedServiceArea = event.detail.value;
        this.dispatchSearchEvent();
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
        this.dispatchSearchEvent();
    }

    dispatchSearchEvent() {
        const searchEvent = new CustomEvent('search', {
            detail: {
                keyword: this.searchKeyword,
                serviceArea: this.selectedServiceArea,
                category: this.selectedCategory
            }
        });
        document.dispatchEvent(searchEvent);
    }

    handleSearch() {
        this.dispatchSearchEvent();
    }


		
// call html instead
		/*
    handleSearch() {
        this.showSearchResults = true;
        const searchResults = this.template.querySelector('c-s-t-p-search-results');
        if (searchResults) {
            searchResults.updateSearchResults(this.searchKeyword, this.selectedServiceArea, this.selectedCategory);
        }
    }*/
}