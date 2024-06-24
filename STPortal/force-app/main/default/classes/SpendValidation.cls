public class SpendValidation {
    
    public static Map<String, Object> validateSpendAllRecords(List<Map<String, String>> spendAllRecords) {
        Map<String, Object> result = new Map<String, Object>();
        List<SpendAll__c> validRecords = new List<SpendAll__c>();
        Set<Map<String, String>> abnErrors = new Set<Map<String, String>>();
        Set<Map<String, String>> categoryErrors = new Set<Map<String, String>>();
        Set<Map<String, String>> amountErrors = new Set<Map<String, String>>();

        Set<String> abnSet = new Set<String>();
        Set<String> categorySet = new Set<String>();

        for (Map<String, String> recordMap : spendAllRecords) {
            if (recordMap.containsKey('ABN')) {
                abnSet.add(recordMap.get('ABN'));
            }
            if (recordMap.containsKey('Category')) {
                categorySet.add(recordMap.get('Category'));
            }
        }

        Map<String, Id> abnToIdMap = new Map<String, Id>();
        if (!abnSet.isEmpty()) {
            for (Account acc : [SELECT Id, Name, ABN__c FROM Account WHERE ABN__c IN :abnSet AND RecordType.Name = 'Social Enterprise']) {
                abnToIdMap.put(acc.ABN__c, acc.Id);
            }
        }

        Map<String, Id> categoryNameToIdMap = new Map<String, Id>();
        if (!categorySet.isEmpty()) {
            for (Category__c cat : [SELECT Id, Name FROM Category__c WHERE Name IN :categorySet]) {
                categoryNameToIdMap.put(cat.Name, cat.Id);
            }
        }

        for (Map<String, String> recordMap : spendAllRecords) {
            SpendAll__c record = new SpendAll__c();
            Boolean hasAbnError = false;
            Boolean hasCategoryError = false;
            Boolean hasAmountError = false;

            if (recordMap.containsKey('Amount')) {
                if (String.isBlank(recordMap.get('Amount'))) {
                    hasAmountError = true;
                } else {
                    record.Amount__c = Decimal.valueOf(recordMap.get('Amount'));
                }
            } else {
                hasAmountError = true;
            }

            if (recordMap.containsKey('Buyer')) {
                String buyerName = recordMap.get('Buyer');
            }
            if (recordMap.containsKey('Supplier')) {
                String supplierName = recordMap.get('Supplier');
                if (!abnToIdMap.containsKey(recordMap.get('ABN'))) {
                    hasAbnError = true;
                } else {
                    record.Supplier__c = abnToIdMap.get(recordMap.get('ABN'));
                }
            }
            if (recordMap.containsKey('ABN')) {
                String abn = recordMap.get('ABN');
                if (!abnToIdMap.containsKey(abn)) {
                    hasAbnError = true;
                }
            }
            if (recordMap.containsKey('Category')) {
                String category = recordMap.get('Category');
                if (!categoryNameToIdMap.containsKey(category)) {
                    hasCategoryError = true;
                }
            }

            if (!hasAbnError && !hasCategoryError && !hasAmountError) {
                validRecords.add(record);
            }
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

        result.put('validRecords', validRecords);
        result.put('abnErrors', new List<Map<String, String>>(abnErrors));
        result.put('categoryErrors', new List<Map<String, String>>(categoryErrors));
        result.put('amountErrors', new List<Map<String, String>>(amountErrors));

        return result;
    }
}