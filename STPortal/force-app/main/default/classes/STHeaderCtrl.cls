public without sharing class STHeaderCtrl {
@AuraEnabled
    public static Metadata initMetadata() {
        return new Metadata();
    }

    @AuraEnabled
    public static void removeRelatedSupplierFromUser() {
        try {
            User currentUser = new User(
                    Id = UserInfo.getUserId(),
                    Related_Supplier__c = null
            );
            update currentUser;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }

    }

    public class Metadata {
        @AuraEnabled public List<MenuItemWrapper> menuItemWrapperList;
        @AuraEnabled public Structs.AccountWrapper accnt;
        @AuraEnabled public String homePageLink;
        @AuraEnabled public String accountManagement;
        @AuraEnabled public User currentUser;
        @AuraEnabled public Boolean isGuest;
        @AuraEnabled public Boolean isEditAvalaible;
        @AuraEnabled public String sid;
        @AuraEnabled public String expiryName;

        public Metadata() {
            this.sid = UserInfo.getSessionId();
            this.currentUser = new UserService().currentUser;
            this.isGuest = UserInfo.getUserType() == 'Guest';
            this.isEditAvalaible = this.currentUser.Profile.Name != Constants.USER_SUPPLIER_RESTRICTED_PROFILE_NAME;
            this.accnt = AccountService.getAccountWrapperById(currentUser.Related_Supplier__c != null ? currentUser.Related_Supplier__r.Contact.AccountId : currentUser.Contact.AccountId);
            initMenuItemWrapperList(currentUser);
        }

        public void initMenuItemWrapperList(User usr) {
            this.menuItemWrapperList = new List<MenuItemWrapper>();
            if (usr.Profile.Name.startsWithIgnoreCase('Buyer Member')) {
                this.homePageLink = 'BG_Home__c';
                this.menuItemWrapperList.add(new MenuItemWrapper('Home', 'BG_Home__c'));
                if (usr.Profile.Name == Constants.USER_BUYER_FULL_PROFILE_NAME) {
                    this.menuItemWrapperList.add(new MenuItemWrapper('Events', 'events'));
                }
                this.menuItemWrapperList.add(new MenuItemWrapper('Tools & Resources', 'tools-and-resources'));
                this.menuItemWrapperList.add(new MenuItemWrapper('Member Network', 'business-government-members'));
                // this.menuItemWrapperList.add(new MenuItemWrapper('Membership Usage', 'membership-usage'));
                this.accountManagement = 'buyer-account-management';
                this.expiryName = 'Membership expiry:';
            } else {
                if (usr.Is_Supplier_Certified__c) {
                    this.homePageLink = 'SE_Home__c';
                    this.menuItemWrapperList.add(new MenuItemWrapper('Home', 'SE_Home__c'));
                    this.menuItemWrapperList.add(new MenuItemWrapper('Tools & Resources', 'tools-and-resources'));
                    this.menuItemWrapperList.add(new MenuItemWrapper('Profile', 'profile-setup-and-payment'));
                } else if (usr.Is_Supplier_Trial__c) {
                    this.homePageLink = 'SE_Home__c';
                    this.menuItemWrapperList.add(new MenuItemWrapper('Home', 'SE_Home__c'));
                    this.menuItemWrapperList.add(new MenuItemWrapper('Profile', 'profile-setup-and-payment'));
//                    if (usr.Is_Supplier_Certified__c) {
//                        this.menuItemWrapperList.add(new MenuItemWrapper('Certification Logos', 'certification-logos'));
//                    }
                } else if (! usr.Is_Related_Supplier__c && (usr.Profile.Name == Constants.USER_SUPPLIER_SYSTEM_ADMINISTRATOR_PROFILE_NAME || usr.Profile.Name == Constants.USER_SUPPLIER_PARENT_ORGANISATION_PROFILE_NAME)) {
                    this.homePageLink = 'parent-organisation-home';
                    this.menuItemWrapperList.add(new MenuItemWrapper('Home', 'parent-organisation-home'));
                    this.menuItemWrapperList.add(new MenuItemWrapper('Payment', 'payment-page'));
                } else {
                    this.homePageLink = 'https://www.socialtraders.com.au';
                }

                this.expiryName = 'Membership expiry:';
                this.accountManagement = 'supplier-account-management';
            }
        }
    }

    public class MenuItemWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String url;

        public MenuItemWrapper(String label, String url) {
            this.label = label;
            this.url = url;
        }
    }
}