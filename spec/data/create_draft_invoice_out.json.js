module.exports = {
    "lastUpdated": "2014-11-18T11:08:00Z",
    "lines": [],
    "currencyExchangeRate": 0,
    "margin": 0,
    "marginPercentage": 0,
    "id": 86,
    "customer": {"customerNumber": 113, "self": "https://restapi.e-conomic.com/customers/113"},
    "customerName": "Customer #1",
    "date": "2014-04-29",
    "dueDate": "2014-05-13",
    "paymentTerms": {"paymentTermsNumber": 3, "self": "https://restapi.e-conomic.com/payment-terms/3"},
    "currency": "USD",
    "vatIncluded": false,
    "layout": {"layoutNumber": 19},
    "netAmount": 0,
    "netAmountBaseCurrency": 0,
    "grossAmount": 0,
    "vatAmount": 0,
    "roundingAmount": 0,
    "deductionAmount": 0,
    "pdf": "https://restapi.e-conomic.com/invoices/drafts/86/pdf",
    "salesDocumentType": "draftInvoice",
    "self": "https://restapi.e-conomic.com/invoices/drafts/86",
    "metaData": {
        "book": {
            "description": "Book a draft invoice.",
            "href": "https://restapi.e-conomic.com/invoices/booked",
            "httpMethod": "post"
        },
        "bookWithNumber": {
            "description": "Book a draft invoice on a specific invoice number.",
            "href": "https://restapi.e-conomic.com/invoices/booked/_4_bookingNumber",
            "httpMethod": "put"
        },
        "delete": {
            "description": "Delete this draft invoice.",
            "href": "https://restapi.e-conomic.com/invoices/drafts/86",
            "httpMethod": "delete"
        },
        "replace": {
            "description": "Replace this draft invoice.",
            "href": "https://restapi.e-conomic.com/invoices/drafts/86",
            "httpMethod": "put"
        },
        "update": {
            "description": "Update a subset of properties on this invoice.",
            "href": "https://restapi.e-conomic.com/invoices/drafts/86",
            "httpMethod": "patch"
        }
    }
};