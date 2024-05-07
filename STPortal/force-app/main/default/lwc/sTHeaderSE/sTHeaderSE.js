import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import socialTradersPortalImages from '@salesforce/resourceUrl/Social_Traders_Portal_Images';

export default class STHeaderSE  extends NavigationMixin(LightningElement) {
		logoUrl = `${socialTradersPortalImages}/SocialTraders_Logo_Tagline_RGB.png`;


		navigate(event) {

				const pageName = event.target.dataset.page;
				console.log('Navigating to page:', pageName);

				switch (pageName) {
								case 'home-se':
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'SE_Home__c' 
                }
            });
            break;

						case 'events':
								this[NavigationMixin.Navigate]({
										type: 'comm__namedPage',
										attributes: {
												name: 'SE_Events__c'  
										}
								});
								break;
						case 'my-account':
								this[NavigationMixin.Navigate]({
										type: 'comm__namedPage',
										attributes: {
												name: 'SE_myAccount__c' 
										}
								});
								break;
						default:
								console.log('Unknown page');
				}
		}

}