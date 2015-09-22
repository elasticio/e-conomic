module.exports = {
    "collection": [
        {
            "customerGroupNumber": 1,
            "name": "Domestic customers",
            "account": {
                "accountNumber": 1100,
                "accountType": "status",
                "balance": 28484.88,
                "blockDirectEntries": true,
                "debitCredit": "debit",
                "name": "Debtors",
                "accountingYears": "https://restapi.e-conomic.com/accounts/1100/accounting-years",
                "self": "https://restapi.e-conomic.com/accounts/1100"
            },
            "customers": "https://restapi.e-conomic.com/customer-groups/1/customers",
            "self": "https://restapi.e-conomic.com/customer-groups/1"
        },
        {
            "customerGroupNumber": 2,
            "name": "Overseas customers",
            "account": {
                "accountNumber": 1100,
                "accountType": "status",
                "balance": 28484.88,
                "blockDirectEntries": true,
                "debitCredit": "debit",
                "name": "Debtors",
                "accountingYears": "https://restapi.e-conomic.com/accounts/1100/accounting-years",
                "self": "https://restapi.e-conomic.com/accounts/1100"
            },
            "customers": "https://restapi.e-conomic.com/customer-groups/2/customers",
            "self": "https://restapi.e-conomic.com/customer-groups/2"
        }
    ],
    "metaData": {},
    "pagination": {
        "maxPageSizeAllowed": 1000,
        "skipPages": 0,
        "pageSize": 20,
        "results": 2,
        "resultsWithoutFilter": 2,
        "firstPage": "https://restapi.e-conomic.com/customer-groups/?skippages=0&pagesize=20",
        "lastPage": "https://restapi.e-conomic.com/customer-groups/?skippages=0&pagesize=20"
    },
    "self": "https://restapi.e-conomic.com/customer-groups/"
};