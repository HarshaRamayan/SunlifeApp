import { LightningElement, wire, api, track } from 'lwc';
import fetchAccounts from '@salesforce/apex/AccountListCntrl.fetchAccounts';

const columns = [
   
    { 
        label: 'Account', fieldName: 'AccountUrl', wrapText: true,sortable:"true",
        type: 'url',
        typeAttributes: {
            label: { 
                fieldName: 'AccountName' 
            },
            target : '_blank'
        } 
    },
    { 
        label: 'Account Owner', fieldName: 'AccountOwnerURL', wrapText: true,
        type: 'url',
        typeAttributes: {
            label: { 
                fieldName: 'AccountOwner' 
            },
            target : '_blank'
        } 
    },
    { label: 'Phone', fieldName: 'Phone' },
    { label: 'Website', fieldName: 'Website' },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue' }

];


            

export default class FinancialServiceAccountList extends LightningElement {
    
    @api result;
    @track error;
    @api recordId;

    columnsList = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    connectedCallback(){
        this.getAllAccDetails();
    }

    getAllAccDetails(){
        fetchAccounts()
            .then(data => {
                /* Iterate with Each record and check if the Case is Associated with Account or Contact
                    then get the Name and display into datatable
                */
                /* Prepare the Org Host */
                //let urlString = window.location.href;
                //let baseURL = urlString.substring(0, urlString.indexOf("/s"));
                let baseURL = window.location.origin +'/';
                console.log('******',window.location.origin);
                data.forEach(accRec => {
                    
                    //accRec.Url = baseURL+caseRec.Id;
                    
                    if(accRec.Id){
                        accRec.AccountName = accRec.Name;
                        /* Prepare Account Detail Page Url */
                        accRec.AccountUrl = baseURL+accRec.Id;
                    }
                     if(accRec.OwnerId){
                        accRec.AccountOwner = accRec.Owner.Name;
                        /* Prepare Account Detail Page Url */
                        accRec.AccountOwnerURL = baseURL+accRec.OwnerId;
                    }

                    
                });
                this.result = data;
                window.console.log(' data ', data);
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                window.console.log(' error ', error);
                this.result = undefined;
            });
    }
    
    handleRowAction(){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Account',
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }

    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [this.result];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
 
}