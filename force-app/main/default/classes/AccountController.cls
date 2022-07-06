public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String industry){
        List<Account> accts = [Select Name, Owner.Name, Phone, 
                               Website, AnnualRevenue, Record_Url__c FROM Account WHERE Industry = :industry];
        return accts;
    }
    @AuraEnabled(cacheable=true)
     public static List<Account> getAccountsByNameAndIndustry(String industry, String name){
        List<Account> accts = [Select Name, Owner.Name, Phone, 
                               Website, AnnualRevenue, Record_Url__c FROM Account WHERE Industry = :industry 
                               AND Name =: name
                              ];
        return accts;
    }
}