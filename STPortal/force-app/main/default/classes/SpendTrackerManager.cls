public class SpendTrackerManager {
    
    public static void manageSpendTrackers(List<SpendAll__c> spends) {
        Map<String, SpendTracker__c> existingTrackers = new Map<String, SpendTracker__c>();
        Map<String, SpendTracker__c> trackersToUpsert = new Map<String, SpendTracker__c>();
        Map<Id, String> spendIdToKeyMap = new Map<Id, String>();
        Set<String> keys = new Set<String>();
        
        for (SpendAll__c spend : spends) {
            if (isValidForProcessing(spend)) {
                String key = buildKey(spend);
                keys.add(key);
                spendIdToKeyMap.put(spend.Id, key);
            }
        }
        
        if (!keys.isEmpty()) {
            for (SpendTracker__c tracker : [
                SELECT Id, Buyer__c, Supplier__c, ABN__c, Financial_Year__c, Total_Spent__c, Total_Received__c, Key__c 
                FROM SpendTracker__c 
                WHERE Key__c IN :keys
            ]) {
                existingTrackers.put(tracker.Key__c, tracker);
            }
        }
        
        for (SpendAll__c spend : spends) {
            if (isValidForProcessing(spend)) {
                String key = buildKey(spend);
                SpendTracker__c tracker = existingTrackers.get(key);
                
                if (tracker == null) {
                    tracker = new SpendTracker__c(
                        Buyer__c = spend.Buyer__c,
                        Supplier__c = spend.Supplier__c,
                        ABN__c = spend.ABN__c,
                        Financial_Year__c = spend.Financial_Year__c,
                        Total_Spent__c = 0.0,
                        Total_Received__c = 0.0, 
                        Key__c = key                   
                    );
                    existingTrackers.put(key, tracker);
                }
                
                if (spend.Status__c.equals('Baseline') || spend.Status__c.equals('Actual')) {
                    tracker.Total_Spent__c += spend.Amount__c;
                }
                
                if ((spend.Status__c.equals('Baseline') || spend.Status__c.equals('Actual')) && !spend.Dedupe__c) {
                    tracker.Total_Received__c += spend.Amount__c;
                }
                
                trackersToUpsert.put(key, tracker);
            }
        }
        
        List<Id> upsertedTrackerIds = new List<Id>();
        if (!trackersToUpsert.isEmpty()) {
            List<Database.UpsertResult> results = Database.upsert(new List<SpendTracker__c>(trackersToUpsert.values()), SpendTracker__c.Key__c);
            for (Database.UpsertResult result : results) {
                if (result.isSuccess()) {
                    upsertedTrackerIds.add(result.getId());
                }
            }
            
            Map<String, Id> keyToIdMap = new Map<String, Id>();
            for (SpendTracker__c tracker : [
                SELECT Id, Key__c 
                FROM SpendTracker__c 
                WHERE Id IN :upsertedTrackerIds
            ]) {
                keyToIdMap.put(tracker.Key__c, tracker.Id);
            }
            
            List<SpendAll__c> spendsToUpdate = new List<SpendAll__c>();
            for (SpendAll__c spend : spends) {
                String key = spendIdToKeyMap.get(spend.Id);
                if (keyToIdMap.containsKey(key)) {
                    spend.SpendTracker__c = keyToIdMap.get(key);
                    spend.Processed__c = true;
                    spendsToUpdate.add(spend);
                }
            }
            if (!spendsToUpdate.isEmpty()) {
                update spendsToUpdate;
            }
        }
    }
    
    private static boolean isValidForProcessing(SpendAll__c spend) {
        return (spend.ABN__c != null || spend.Supplier__c != null) &&
            spend.Financial_Year__c != null &&
            spend.Amount__c != null &&
            (spend.Status__c.equals('Baseline') || spend.Status__c.equals('Actual'));
    }
    
    private static String buildKey(SpendAll__c spend) {
        String supplierId = (spend.Supplier__c != null) ? String.valueOf(spend.Supplier__c) : '';
        String buyerId = String.valueOf(spend.Buyer__c);
        String financialYear = spend.Financial_Year__c;
        return financialYear + '-' + buyerId + '-' + supplierId;
    }
}