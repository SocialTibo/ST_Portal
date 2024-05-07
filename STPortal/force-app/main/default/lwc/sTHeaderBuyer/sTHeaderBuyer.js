import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import socialTradersPortalImages from '@salesforce/resourceUrl/Social_Traders_Portal_Images';

export default class STHeaderBuyer extends NavigationMixin(LightningElement) {
				    logoUrl = `${socialTradersPortalImages}/SocialTraders_Logo_Tagline_RGB.png`;

		
		navigate(event) {
    const pageName = event.target.dataset.page;
    switch (pageName) {
        case 'home':
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'BG_Home__c' 
                }
            });
            break;
        case 'dashboard':
            this[NavigationMixin.Navigate]({
                type:'comm__namedPage',
                attributes: {
                    name: 'BG_Dashboard__c' 
                }
            });
            break;
        case 'spend':
            this[NavigationMixin.Navigate]({
                type:'comm__namedPage',
                attributes: {
                    name: 'BG_Spend__c' 
                }
            });
            break;
        case 'my-account':
            this[NavigationMixin.Navigate]({
                type:'comm__namedPage',
                attributes: {
                    name: 'BG_myAccount__c' 
                }
            });
            break;
        default:
            console.log('Unknown page');
    }
}

}