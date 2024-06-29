public without sharing class UserService {
	public User currentUser {get; set;}
	
	public UserService() {
		this.currentUser = getCurrentUser();
	}

    public static User getCurrentUser() {
		return [
			SELECT Id, ContactId, Contact.AccountId, Email, Phone, FirstName, LastName,
					Name, Contact.Account.Name, Profile.Name, Related_Supplier__c,
					Related_Supplier__r.Contact.AccountId, Related_Supplier__r.Contact.Account.Name, Related_Supplier__r.Profile.Name,
                    Related_Supplier__r.Contact.Account.Profile_Published__c, Contact.Account.Profile_Published__c,
                    Is_First_Login__c, Is_Supplier_Certified__c, Is_Supplier_Trial__c, Is_Related_Supplier__c, 
                    Contact.FirstName, Contact.LastName, Contact.Email, Contact.Phone, Contact.RecordTypeId
			FROM User 
			WHERE Id = : UserInfo.getUserId()
			LIMIT 1
		];
    }

    public static User getUserById(String userId) {
        return [
            SELECT Id, ContactId, Contact.AccountId, Email, Phone, FirstName, LastName,
                    Name, Contact.Account.Name, Profile.Name, Related_Supplier__c,
                    Related_Supplier__r.Contact.AccountId, Related_Supplier__r.Contact.Account.Name, Related_Supplier__r.Profile.Name,
                    Related_Supplier__r.Contact.Account.Profile_Published__c, Contact.Account.Profile_Published__c,
                    Is_First_Login__c, Is_Supplier_Certified__c, Is_Supplier_Trial__c, Is_Related_Supplier__c, 
                    Contact.FirstName, Contact.LastName, Contact.Email, Contact.Phone, Contact.RecordTypeId
            FROM User 
            WHERE Id = :userId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Id getContactId(Id userId) {
        User user = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];
        return user.ContactId;
    }
    
    @InvocableMethod(label='Update User Profile' description='Update User Profile depends on Account Status')
    public static void updateUserProfile(AccountParam[] accountParams) {
        if (! SubscriptionsUpdatesBatch.isRunning) {
            for (AccountParam accParam : accountParams) {
                if (UserInfo.getUserType() == 'Standard' && !System.isBatch() && !System.isFuture()) {
                    updateUserProfiles(accParam.accountId, accParam.profileName);
                } else {
                    List<User> userList = [SELECT Id FROM User WHERE Contact.AccountId = :accParam.accountId AND isActive = TRUE];
                    if (! userList.isEmpty()) {
                        for (User usr : userList) {
                            System.enqueueJob(new UpdateUserProfileQueueable(usr.Id, accParam.profileName));
                        }
                    }
                }
            }
        }
    }

    @future
    public static void updateUserProfiles(String accountId, String profileName) {
        List<User> userList = [SELECT Id FROM User WHERE Contact.AccountId = :accountId AND isActive = TRUE];
        if (! userList.isEmpty()) {
            Id profileId = profileName != 'No Access' ? [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1].Id : null;
            for (User usr : userList) {
                if (profileId != null) {
                    usr.IsActive = true;
                    usr.ProfileId = profileId;
                } else {
                    usr.IsActive = false;
                }
            }
            update userList;
        }
    }

    public class AccountParam{
        @InvocableVariable(required=true)
        public Id accountId;
        @InvocableVariable(required=true)
        public String profileName;
    }    
}