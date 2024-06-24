public class SpendCSVUtilities {
    
     // to create a CSV of certified SEs --------------------
    @AuraEnabled(cacheable=true)
    public static String getSupplierListCSV() {
        List<Account> supplierList = [
            SELECT Name, ABN__c
            FROM Account
            WHERE Status__c IN ('Certified', 'Certified (Grace Period)')
            AND RecordType.Name = 'Social Enterprise'
        ];
        
        String csv = 'Name,ABN\n';
        
        for (Account acc : supplierList) {
            csv += '"' + acc.Name + '","' + acc.ABN__c + '\n';
        }
        
        return csv;
    }
    
   // to create CSV of blank SpendAll template ------------------------------------
    @AuraEnabled(cacheable=true)
    public static String getBlankTemplateCSV() {
        List<String> selectedFields = new List<String>{
            'Buyer__c', 'ABN__c', 'Supplier__c',  'Amount__c','Financial_Year__c', 'Category__c' 
        };
                    
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.SpendAll__c.fields.getMap();
        List<String> fieldLabels = new List<String>();
        
        for (String fieldName : selectedFields) {
            if (fieldMap.containsKey(fieldName)) {
                fieldLabels.add(fieldMap.get(fieldName).getDescribe().getLabel());
            } else {
                fieldLabels.add(fieldName); 
            }
        }
        
        String csvHeader = String.join(fieldLabels, ',') + '\n';
        
        return csvHeader;
    }
}