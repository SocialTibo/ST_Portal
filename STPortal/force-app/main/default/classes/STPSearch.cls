public with sharing class STPSearch {
    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getResult(String keyword, String serviceArea, String category) {
        String accountQuery = 'SELECT Id, Name, Description, ABN__c, Primary_Beneficiaries__c, ' +
                              '(SELECT State__c FROM Locations__r) ' +
                              'FROM Account WHERE ';
        List<String> accountConditions = new List<String>();

        // Keyword filter
        if (String.isNotBlank(keyword)) {
            String keywordCondition = '(Name LIKE \'%' + String.escapeSingleQuotes(keyword) + '%\')';
            System.debug('Keyword Condition: ' + keywordCondition);
            accountConditions.add(keywordCondition);
        }

        // Service Area filter
        if (String.isNotBlank(serviceArea) && serviceArea != 'All') {
            String serviceAreaCondition = 'Id IN (SELECT Account__c FROM Location__c WHERE State__c = \'' + String.escapeSingleQuotes(serviceArea) + '\')';
            System.debug('Service Area Condition: ' + serviceAreaCondition);
            accountConditions.add(serviceAreaCondition);
        }

        if (!accountConditions.isEmpty()) {
            accountQuery += String.join(accountConditions, ' AND ');
        } else {
            accountQuery = 'SELECT Id, Name, Description, ABN__c, Primary_Beneficiaries__c, ' +
                           '(SELECT State__c FROM Locations__r) ' +
                           'FROM Account';
        }

        System.debug('Account SOQL Query: ' + accountQuery);
        List<Account> accounts = Database.query(accountQuery);
        System.debug('Account Query Results: ' + accounts);

        // Get related Supplier_Product_Service__c records
        Set<Id> accountIds = new Set<Id>();
        for (Account acc : accounts) {
            accountIds.add(acc.Id);
        }

        String spsQuery = 'SELECT Account__c, Product_Service__r.Category__r.Name ' +
                          'FROM Supplier_Product_Service__c ' +
                          'WHERE Account__c IN :accountIds';
        List<Supplier_Product_Service__c> spsResults = Database.query(spsQuery);
        System.debug('Supplier_Product_Service Query Results: ' + spsResults);

        // Aggregate categories by account
        Map<Id, Set<String>> accountCategoriesMap = new Map<Id, Set<String>>();
        for (Supplier_Product_Service__c sps : spsResults) {
            if (!accountCategoriesMap.containsKey(sps.Account__c)) {
                accountCategoriesMap.put(sps.Account__c, new Set<String>());
            }
            if (sps.Product_Service__r != null && sps.Product_Service__r.Category__r.Name != null) {
                accountCategoriesMap.get(sps.Account__c).add(sps.Product_Service__r.Category__r.Name);
            }
        }

        // Build AccountWrapper list with category filtering
        List<AccountWrapper> results = new List<AccountWrapper>();
        for (Account acc : accounts) {
            if (category == 'All' || (accountCategoriesMap.containsKey(acc.Id) && accountCategoriesMap.get(acc.Id).contains(category))) {
                AccountWrapper wrappedAccount = new AccountWrapper();
                wrappedAccount.account = acc;

                // Add service areas
                Set<String> distinctServiceAreas = new Set<String>();
                if (acc.Locations__r != null) {
                    for (Location__c loc : acc.Locations__r) {
                        distinctServiceAreas.add(loc.State__c);
                    }
                }
                wrappedAccount.serviceAreas = new List<String>(distinctServiceAreas);

                // Add categories
                if (accountCategoriesMap.containsKey(acc.Id)) {
                    wrappedAccount.categories = new List<String>(accountCategoriesMap.get(acc.Id));
                } else {
                    wrappedAccount.categories = new List<String>();
                }

                results.add(wrappedAccount);
            }
        }

        return results;
    }

    @AuraEnabled(cacheable=true)
    public static String fetchAccountLogo(Id accountId) {
        List<ContentDocumentLink> cdlList = [
            SELECT ContentDocumentId, ContentDocument.Title 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :accountId 
            AND ContentDocument.Title LIKE '[Logo]%'
            LIMIT 1
        ];

   if (!cdlList.isEmpty()) {
            String documentId = cdlList[0].ContentDocumentId;
            System.debug('Fetched document ID: ' + documentId);
            // Construct the URL using the correct base URL for your site
            return 'https://socialtraders--stdev.sandbox.my.site.com/SocialTraders/sfc/servlet.shepherd/document/download/' + documentId;
        }

        return null;
    }

    public class AccountWrapper {
        @AuraEnabled
        public Account account { get; set; }
        @AuraEnabled
        public List<String> serviceAreas { get; set; }
        @AuraEnabled
        public List<String> categories { get; set; }
    }
}