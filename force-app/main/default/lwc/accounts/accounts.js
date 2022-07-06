import { LightningElement, wire, api, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getAccountsByNameAndIndustry from '@salesforce/apex/AccountController.getAccountsByNameAndIndustry';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import OWNER_FIELD from '@salesforce/schema/Account.OwnerId';
import RECORD_URL_FIELD from '@salesforce/schema/Account.Record_Url__c';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
const COLUMNS = [
    { label: 'Account Name', fieldName: RECORD_URL_FIELD.fieldApiName, type: 'url', sortable: true,  editable: true,
     typeAttributes: { label: { fieldName: NAME_FIELD.fieldApiName},  target: '_blank'} },
    { label: 'Owner', fieldName: OWNER_FIELD.fieldApiName, type: 'text', sortable: true  },
    { label: 'Phone', fieldName: PHONE_FIELD.fieldApiName, type: 'phone', editable: true  },
    { label: 'Website', fieldName: WEBSITE_FIELD.fieldApiName, type: 'url' , editable: true },
    { label: 'Annual Revenue', fieldName: REVENUE_FIELD.fieldApiName, type: 'currency' , editable: true } 
];

export default class Accounts extends LightningElement {
    @api industry ='Financial Services';
    @track data = {};
    columns = COLUMNS;
    draftValues = [];
    accountName;
    /** getAccounts Based on the industry value */
    @wire(getAccounts, {industry: '$industry'}) accounts({data, error}) {
        if (data) {
            this.data = data;
        } else if (error) {
            this.data = undefined;
        }
    }

    /** Save the edited records from datatable */
    async handleSave(event){
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });
        this.draftValues = [];

        try {
            const recordUpdatePromises = records.map((record) =>
                updateRecord(record)
            );
            await Promise.all(recordUpdatePromises);
            /** Display success toast on updating the record successfully */
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            );

            await refreshApex(this.data);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading contacts',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }

    }

    /** handler for input to capture user's entered value */
    handleInputChange(event) {
        this.accountName = event.detail.value;
    }
    
    /** search for accounts based on industry and account name on button click */
    submitSearch(){
        getAccountsByNameAndIndustry({
            industry: this.industry,
            name: this.accountName
        })
            .then(accounts => {
                this.data = accounts;
            })
            .catch(error => {
            });
        
    }

}