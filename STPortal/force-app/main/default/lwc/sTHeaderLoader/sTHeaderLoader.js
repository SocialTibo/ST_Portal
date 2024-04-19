import { LightningElement, track, wire } from 'lwc';
import initMetadata from '@salesforce/apex/STHeaderCtrl.initMetadata';

export default class STHeaderLoader extends LightningElement {
    @track metadata;
    @track isDisplay = false;

    connectedCallback() {
        this.getMetadata();
    }

    get shouldDisplayHeader() {
        return (this.metadata && ((!this.metadata.isGuest && this.metadata.pageName !== 'social-enterprise-finder') || this.metadata.pageName === 'apply-for-certification'));
    }

    getMetadata() {
        initMetadata()
            .then(result => {
                this.metadata = result || {};
                this.metadata.pageName = this.getPageName();
                this.isDisplay = true;
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
            });
    }

    getPageName() {
        const path = window.location.pathname;
        const pageName = path.split('portal/s/')[1].split('?')[0];
        return pageName;
    }
}