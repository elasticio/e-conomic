module.exports = {
    "collection": [
        {
            "paymentTermsNumber": 2,
            "contraAccountForPrepaidAmount": {
                "accountNumber": 1200,
                "self": "https://restapi.e-conomic.com/accounts/1200"
            },
            "name": "Cash",
            "self": "https://restapi.e-conomic.com/payment-terms/2"
        },
        {
            "paymentTermsNumber": 3,
            "daysOfCredit": 14,
            "name": "Invoice date + 14 days",
            "self": "https://restapi.e-conomic.com/payment-terms/3"
        },
        {
            "paymentTermsNumber": 4,
            "daysOfCredit": 30,
            "name": "Invoice date + 30 days",
            "self": "https://restapi.e-conomic.com/payment-terms/4"
        },
        {
            "paymentTermsNumber": 5,
            "daysOfCredit": 8,
            "name": "Net 8 days",
            "self": "https://restapi.e-conomic.com/payment-terms/5"
        }
    ],
    "metaData": {},
    "pagination": {
        "maxPageSizeAllowed": 1000,
        "skipPages": 0,
        "pageSize": 20,
        "results": 4,
        "resultsWithoutFilter": 4,
        "firstPage": "https://restapi.e-conomic.com/payment-terms/?skippages=0&pagesize=20",
        "lastPage": "https://restapi.e-conomic.com/payment-terms/?skippages=0&pagesize=20"
    },
    "self": "https://restapi.e-conomic.com/payment-terms/"
};