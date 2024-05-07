import { LightningElement, track, api } from 'lwc';
import initMetadata from '@salesforce/apex/STHeaderCtrl.initMetadata';

export default class STHeaderLoader extends LightningElement {
    @track metadata;
    @track isDisplay = false; // Control the display based on your requirements
    @track isBuyer = false;

    connectedCallback() {
        initMetadata()
            .then(result => {
                console.log('Metadata:', result); // Debug metadata
                if (result && result.currentUser && result.currentUser.ProfileId) {
                    console.log('Profile ID:', result.currentUser.ProfileId); // Assuming ProfileId is part of currentUser
                }
                this.metadata = result;
                this.isDisplay = true; // Assuming you want to display when metadata is loaded
                if (result && typeof result.isGuest !== 'undefined' && result.homePageLink === "home-bg") {
                    console.log('Buyer profile detected');
                    this.isBuyer = true;
                }
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
                this.isDisplay = false; // Optionally hide on error
            });
    }
}