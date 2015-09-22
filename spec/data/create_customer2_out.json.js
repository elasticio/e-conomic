module.exports = {
    "customerNumber": 112,
    "currency": "GBP",
    "paymentTerms": {
        "self": "https://restapi.e-conomic.com/payment-terms/3"
    },
    "customerGroup": {
        "self": "https://restapi.e-conomic.com/customer-groups/1"
    },
    "vatZone": "Abroad",
    "address": "Address",
    "balance": 0.00,
    "city": "Berlin",
    "country": "Country",
    "email": "customer2@elastic.io",
    "barred": false,
    "name": "Customer #2",
    "zip": "ZIP",
    "telephoneAndFaxNumber": "0382222222222",
    "website": "http://elastic.io/customer2",
    "vatNumber": "987654321",
    "self": "https://restapi.e-conomic.com/customers/112",
    "metaData": {
        "delete": {
            "description": "Delete this customer.",
            "href": "https://restapi.e-conomic.com/customers/112",
            "httpMethod": "delete"
        },
        "replace": {
            "description": "Replace this customer.",
            "href": "https://restapi.e-conomic.com/customers/112",
            "httpMethod": "put"
        },
        "update": {
            "description": "Update a subset of properties on this customer.",
            "href": "https://restapi.e-conomic.com/customers/112",
            "httpMethod": "patch"
        }
    }
};