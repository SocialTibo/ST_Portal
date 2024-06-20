import { LightningElement } from 'lwc';
import getBlankTemplateCSV from '@salesforce/apex/SpendService.getBlankTemplateCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ButtonDownloadBlankTemplate extends LightningElement {
    handleClick() {
        getBlankTemplateCSV()
            .then(result => {
                this.downloadCSV(result, 'BlankTemplateSpend.csv');
            })
            .catch(error => {
                this.showErrorToast('Failed to download the blank template');
                console.error('Apex method failed:', error);
            });
    }

    downloadCSV(csvContent, filename) {
        const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const a = document.createElement('a');
        a.href = csvData;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    showErrorToast(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error',
            }),
        );
    }
}