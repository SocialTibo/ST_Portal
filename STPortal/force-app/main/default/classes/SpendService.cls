public class SpendService {
    
    @InvocableMethod
    public static void invokeSpendTrackerBatch(List<String> params) {
        SpendTrackerBatch batch = new SpendTrackerBatch();
        Database.executeBatch(batch);
    }
    
    public static void manageSpendTrackers(List<SpendAll__c> spends) {
        SpendTrackerManager.manageSpendTrackers(spends);
    }
    
    @AuraEnabled(cacheable=true)
    public static String getSupplierListCSV() {
        return SpendCSVUtilities.getSupplierListCSV();
    }
    
    @AuraEnabled(cacheable=true)
    public static String getBlankTemplateCSV() {
        return SpendCSVUtilities.getBlankTemplateCSV();
    }
    
    @AuraEnabled
    public static Map<String, Object> validateSpendAllRecords(List<Map<String, String>> spendAllRecords) {
        return SpendValidation.validateSpendAllRecords(spendAllRecords);
    }

    @AuraEnabled
    public static void insertSpendAllRecords(List<SpendAll__c> validRecords) {
        insert validRecords;
    }
}