global class SpendTrackerBatch implements Database.Batchable<SpendAll__c> {
    global Iterable<SpendAll__c> start(Database.BatchableContext BC) {
        return (Iterable<SpendAll__c>)Database.getQueryLocator([
            SELECT Id, Status__c, ABN__c, Buyer__c, Financial_Year__c, Amount__c, Supplier__c, Dedupe__c, Processed__c  
            FROM SpendAll__c 
            WHERE Status__c IN ('Baseline', 'Actual') AND Processed__c = false
        ]);
    }

    global void execute(Database.BatchableContext BC, List<SpendAll__c> records) {
        if (!records.isEmpty()) {
            SpendService.manageSpendTrackers(records);
        } else {
        }
    }

    global void finish(Database.BatchableContext BC) {
    }
}