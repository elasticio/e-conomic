module.exports = {
    "date": "2014-04-29T15:16:57",
    "currency": "GBP",
    "paymentTerms": {
        self: 'https://restapi.e-conomic.com/payment-terms/3'
    },
    "customer": {
        "name": "Customer #1",
        "email": "super@email.com",
        "country": "Germany"
    },
    "lines": [
        {
            "description": "Line 1",
            "unitPrice": 1000,
            "quantity": 5,
            "product": {
                "productNumber": '111111',
                "name": 'test',
                "productGroup": {
                    "productGroupNumber": 1
                }
            }
        },
        {
            "description": "Line 2",
            "unitPrice": 1000,
            "quantity": 5,
            "product": {
                "productNumber": '222222',
                "name": 'test',
                "productGroup": {
                    "productGroupNumber": 1
                }
            }
        }
    ]
};