import { LightningElement, api, track, wire  } from 'lwc';
import fetchAccountLogo from '@salesforce/apex/STPSearch.fetchAccountLogo';

export default class STPSearchResultTile extends LightningElement {
    @api account;
    @api serviceAreas;
    @api categories;
		
    @track isDescriptionExpanded = false;
		@track fileURL;

    
    connectedCallback() {
        console.log('Account object:', JSON.stringify(this.account));
        console.log('Service areas:', JSON.stringify(this.serviceAreas));
        console.log('Categories:', JSON.stringify(this.categories));
    }
		
		
     @wire(fetchAccountLogo, { accountId: '$account.Id' })
    wiredAccountLogo({ error, data }) {
        if (data) {
            this.fileURL = data;
            console.log('Fetched file URL:', this.fileURL);
        } else if (error) {
            console.error('Error fetching account logo:', error);
            this.fileURL = null; // Fallback to null if there's an error
        }
    }
		
		get accountWebsite() {
        return this.account && this.account.Website ? this.account.Website : '#';
    }
		
    get accountUrl() {
        return this.account && this.account.Id ? `/lightning/r/Account/${this.account.Id}/view` : '#';
    }

    get accountLogo() {
        if (this.account && this.account.enterpriseLogoId) {
            return `/sfc/servlet.shepherd/document/download/${this.account.enterpriseLogoId}`;
        }
        return '/resources/default-logo.png'; // Update with your default logo path
    }

    get formattedServiceAreas() {
        return this.serviceAreas ? this.serviceAreas.join(', ') : '';
    }

    get formattedCategories() {
        return this.categories ? this.categories.join(', ') : '';
    }

    get formattedBeneficiaries() {
        return this.account && this.account.Primary_Beneficiaries__c ? 
            this.account.Primary_Beneficiaries__c.split(';').join(', ') : '';
    }

    get shortDescription() {
        if (this.account && this.account.Description) {
            return this.isDescriptionExpanded ? this.account.Description : this.account.Description.substring(0, 100) + '...';
        }
        return '';
    }

    get descriptionClass() {
        return this.isDescriptionExpanded ? 'full-description' : 'short-description';
    }

    get readMoreText() {
        return this.isDescriptionExpanded ? 'Read less' : 'Read more';
    }

    toggleReadMore() {
        this.isDescriptionExpanded = !this.isDescriptionExpanded;
    }

   

    handleVendorWindowOpen() {
        // Handle opening vendor panel window
    }

    openContactSupplierModal() {
        // Handle opening contact supplier modal
    }
}