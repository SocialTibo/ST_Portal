import { LightningElement } from 'lwc';
import getSupplierListCSV from '@salesforce/apex/SpendService.getSupplierListCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ButtonDownloadSupplierList extends LightningElement {
    handleClick() {
        getSupplierListCSV()
            .then(result => {
                try {
                    this.downloadCSV(result);
                } catch (e) {
                    console.error('Download failed:', e);
                    this.showErrorToast();
                }
            })
            .catch(error => {
                this.showErrorToast();
                console.error('Apex method failed:', error);
            });
    }

    downloadCSV(csvContent) {
        const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const a = document.createElement('a');
        a.href = csvData;
        a.download = 'SupplierList.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    showErrorToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Failed to download the supplier list',
                variant: 'error',
            }),
        );
    }
}