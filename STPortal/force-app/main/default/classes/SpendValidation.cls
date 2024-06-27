public class SpendValidation {
    /**
     * Validates a list of SpendAll__c records and categorizes them into valid records, ABN errors, category errors, and amount errors.
     * 
     * @param spendAllRecords List of maps representing SpendAll__c records from the CSV file.
     * @param contactId Id of the contact uploading the file.
     * @return A map containing lists of valid records, ABN errors, category errors, and amount errors.
     */
    public static Map<String, Object> validateSpendAllRecords(List<Map<String, String>> spendAllRecords, Id contactId) {
        // Result map to store validation results
        Map<String, Object> result = new Map<String, Object>();
        // List to store valid SpendAll__c records
        List<SpendAll__c> validRecords = new List<SpendAll__c>();
        // Sets to store records with specific validation errors
        Set<Map<String, String>> abnErrors = new Set<Map<String, String>>();
        Set<Map<String, String>> categoryErrors = new Set<Map<String, String>>();
        Set<Map<String, String>> amountErrors = new Set<Map<String, String>>();

        // Sets to collect unique ABNs and categories from the input records
        Set<String> abnSet = new Set<String>();
        Set<String> categorySet = new Set<String>();

        // Collect ABNs and categories from the input records
        for (Map<String, String> recordMap : spendAllRecords) {
            if (recordMap.containsKey('ABN')) {
                abnSet.add(recordMap.get('ABN'));
            }
            if (recordMap.containsKey('Category')) {
                categorySet.add(recordMap.get('Category'));
            }
        }

        // Map to store ABN to Account Id mappings
        Map<String, Id> abnToIdMap = new Map<String, Id>();
        // Retrieve Account Ids for the collected ABNs
        if (!abnSet.isEmpty()) {
            for (Account acc : [SELECT Id, Name, ABN__c FROM Account WHERE ABN__c IN :abnSet AND RecordType.Name = 'Social Enterprise']) {
                abnToIdMap.put(acc.ABN__c, acc.Id);
            }
        }

        // Map to store category name to Category__c Id mappings
        Map<String, Id> categoryNameToIdMap = new Map<String, Id>();
        // Retrieve Category__c Ids for the collected categories
        if (!categorySet.isEmpty()) {
            for (Category__c cat : [SELECT Id, Name FROM Category__c WHERE Name IN :categorySet]) {
                categoryNameToIdMap.put(cat.Name, cat.Id);
            }
        }

        // Retrieve buyer's account ID using contact ID
        /*
        String buyerAccountId;
        if (contactId != null) {
            try {
                buyerAccountId = [SELECT AccountId FROM Contact WHERE Id = :contactId LIMIT 1].AccountId;
            } catch (Exception e) {
                throw new AuraHandledException('Error retrieving buyer account ID for contact: ' + contactId);
            }
        } else {
            throw new AuraHandledException('No contact ID provided');
        }*/
        // Set Buyer field
           // record.Buyer__c = buyerAccountId;


        // Validate each record and categorize them into valid records and specific errors
        for (Map<String, String> recordMap : spendAllRecords) {
            SpendAll__c record = new SpendAll__c();
            Boolean hasAbnError = false;
            Boolean hasCategoryError = false;
            Boolean hasAmountError = false;

            // Validate Amount field
            if (recordMap.containsKey('Amount')) {
                if (String.isBlank(recordMap.get('Amount'))) {
                    hasAmountError = true;
                } else {
                    record.Amount__c = Decimal.valueOf(recordMap.get('Amount'));
                }
            } else {
                hasAmountError = true;
            }

            

            // Validate and set Supplier field using ABN
            if (recordMap.containsKey('Supplier')) {
                String supplierName = recordMap.get('Supplier');
                if (!abnToIdMap.containsKey(recordMap.get('ABN'))) {
                    hasAbnError = true;
                } else {
                    record.Supplier__c = abnToIdMap.get(recordMap.get('ABN'));
                }
            }

            // Validate ABN field
            if (recordMap.containsKey('ABN')) {
                String abn = recordMap.get('ABN');
                if (!abnToIdMap.containsKey(abn)) {
                    hasAbnError = true;
                } else {
                    record.ABN__c = abn; // Set ABN__c here
                }
            }

            // Validate and set Category field
            if (recordMap.containsKey('Category')) {
                String category = recordMap.get('Category');
                if (!categoryNameToIdMap.containsKey(category)) {
                    hasCategoryError = true;
                } else {
                    record.Category__c = categoryNameToIdMap.get(category); // Assuming Category__c is a lookup field
                }
            }

            // Set Financial Year field if present
            if (recordMap.containsKey('Financial Year')) {
                record.Financial_Year__c = recordMap.get('Financial Year');
            }

            // Add record to validRecords list if no errors found
            if (!hasAbnError && !hasCategoryError && !hasAmountError) {
                validRecords.add(record);
            }
            // Add record to specific error sets if errors found
            if (hasAbnError) {
                abnErrors.add(recordMap);
            }
            if (hasCategoryError) {
                categoryErrors.add(recordMap);
            }
            if (hasAmountError) {
                amountErrors.add(recordMap);
            }
        }

        // Store validation results in the result map
        result.put('validRecords', validRecords);
        result.put('abnErrors', new List<Map<String, String>>(abnErrors));
        result.put('categoryErrors', new List<Map<String, String>>(categoryErrors));
        result.put('amountErrors', new List<Map<String, String>>(amountErrors));

        return result;
    }

    // used to search Supplier in the unmtachedABN step
    @AuraEnabled(cacheable=true)
    public static List<Account> searchSupplierAccounts(String searchTerm) {
        if (String.isBlank(searchTerm)) {
            return new List<Account>();
        }
        
        String searchPattern = '%' + searchTerm + '%';
        return [
            SELECT Id, Name 
            FROM Account 
            WHERE Name LIKE :searchPattern
            AND RecordType.Name = 'Social Enterprise' 
            LIMIT 10
        ];
    }
}
