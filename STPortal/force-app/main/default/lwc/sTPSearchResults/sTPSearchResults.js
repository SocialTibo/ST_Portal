import { LightningElement, track, api } from 'lwc';
import getSearchResults from '@salesforce/apex/STPSearch.getResult';

export default class STPSearchResults extends LightningElement {
    @track searchResults = [];
    @track visibleResults = [];
    @track error;
    @track isLoading = false;
    @track currentPage = 1;
    @track pageSize = 9; // number of results per load

    @api keyword = '';
    @api serviceArea = '';
    @api category = '';

    connectedCallback() {
        document.addEventListener('search', this.handleSearchEvent.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('search', this.handleSearchEvent.bind(this));
    }

    handleSearchEvent(event) {
        const { keyword, serviceArea, category } = event.detail;
        this.updateSearchResults(keyword, serviceArea, category);
    }

    handleKeywordChange(event) {
        this.keyword = event.target.value;
    }

    handleServiceAreaChange(event) {
        this.serviceArea = event.target.value;
    }

    handleCategoryChange(event) {
        this.category = event.target.value;
    }

    @api
    updateSearchResults(keyword, serviceArea, category) {
        console.log('updateSearchResults called with:', keyword, serviceArea, category);
        this.keyword = keyword;
        this.serviceArea = serviceArea;
        this.category = category;
        this.currentPage = 1; // Reset the page to 1 on new search
        this.performSearch();
    }

    performSearch() {
        this.isLoading = true;

        console.log('Performing search with parameters:', {
            keyword: this.keyword,
            serviceArea: this.serviceArea,
            category: this.category
        });

        getSearchResults({
            keyword: this.keyword,
            serviceArea: this.serviceArea,
            category: this.category
        })
            .then(result => {
                console.log('Search results:', result);
                this.searchResults = result.map(wrappedAccount => {
                    return {
                        account: wrappedAccount.account,
                        serviceAreas: wrappedAccount.serviceAreas,
                        categories: wrappedAccount.categories,
                        fileURL: wrappedAccount.fileURL
                    };
                });
                this.updateVisibleResults(true); // Reset visible results on new search
                this.error = undefined;
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                this.error = error;
                this.searchResults = [];
                this.isLoading = false;
            });
    }

    updateVisibleResults(reset = false) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        if (reset) {
            this.visibleResults = this.searchResults.slice(startIndex, endIndex);
        } else {
            this.visibleResults = [...this.visibleResults, ...this.searchResults.slice(startIndex, endIndex)];
        }
    }

    loadMore() {
        this.currentPage++;
        this.updateVisibleResults();
    }

    get showLoadMoreButton() {
        return this.visibleResults.length < this.searchResults.length;
    }

    get accountCountMessage() {
        const count = this.searchResults.length;
        return `${count} ${count === 1 ? 'result' : 'results'} found`;
    }
}