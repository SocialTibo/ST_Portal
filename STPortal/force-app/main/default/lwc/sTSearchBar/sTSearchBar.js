import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getServiceLocationOptions from '@salesforce/apex/SPSearchBarCtrl.getServiceLocationOptions';
import getProductCategoryOptions from '@salesforce/apex/SPSearchBarCtrl.getProductCategoryOptions';

export default class sTSearchBar extends NavigationMixin(LightningElement) {
    @track searchKeyword = '';
    @track selectedServiceArea = '';
    @track selectedCategory = '';

    @track serviceAreaOptions = [];
    @track categoryOptions = [];

    @wire(getServiceLocationOptions)
    wiredServiceLocations({ error, data }) {
        if (data) {
            this.serviceAreaOptions = data.map(option => ({ label: option.name, value: option.name }));
        } else if (error) {
            console.error('Error fetching service location options:', error);
        }
    }

    @wire(getProductCategoryOptions)
    wiredProductCategories({ error, data }) {
        if (data) {
            this.categoryOptions = data.map(option => ({ label: option.name, value: option.name }));
        } else if (error) {
            console.error('Error fetching product category options:', error);
        }
    }

    handleSearchChange(event) {
        this.searchKeyword = event.target.value;
    }

    handleServiceAreaChange(event) {
        this.selectedServiceArea = event.detail.value;
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleSearch() {
        // Perform the search logic here
        console.log('Search Keyword:', this.searchKeyword);
        console.log('Selected Service Area:', this.selectedServiceArea);
        console.log('Selected Category:', this.selectedCategory);

        // Construct the URL with query parameters
        let url = `/searchresult?keyword=${this.searchKeyword}&serviceArea=${this.selectedServiceArea}&category=${this.selectedCategory}`;

        // Navigate to the search results page
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}