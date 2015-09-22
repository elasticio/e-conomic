var _ = require('lodash-node');

/**
 * Updates a customer if externalId is present in a snapshot
 * Updates a customer by email if customer with that email exists
 * Creates a customer otherwise
 */

function CustomersModule(client) {

    function promiseCreateOrUpdateCustomer(body, cfg, idFromSnapshot){

        var customer = buildCustomer(body, cfg);

        if (idFromSnapshot) {
            return promiseUpdateCustomer(idFromSnapshot, customer);
        } else if (customer.email) {
            return promiseUpdateOrCreateByEmail(customer.email, customer);
        } else {
            return promiseCreateCustomer(customer);
        }
    }

    function buildCustomer(body, cfg){

        var customer =  _.pick(body, ['name', 'email', 'country', 'county', 'zip', 'city',
            'address', 'telephoneAndFaxNumber','vatNumber', 'website', 'currency']);

        customer.currency = customer.currency || cfg.currency;

        customer.customerGroup = {
            self: "https://restapi.e-conomic.com/customer-groups/" + cfg.customerGroupId
        };
        customer.paymentTerms = {
            self: "https://restapi.e-conomic.com/payment-terms/" + cfg.paymentTermId
        };
        customer.vatZone = {
            self: "https://restapi.e-conomic.com/vat-zones/" + cfg.vatZoneId
        };

        return customer;
    }

    function promiseUpdateCustomer(customerNumber, customer){
        console.log('Update customer');
        return client.put('customers' + '/' + customerNumber, customer);
    }

    function promiseCreateCustomer(customer){
        console.log('Create customer');
        return client.post('customers', customer);
    }

    function promiseUpdateOrCreateByEmail(email, customer) {

        return client.get('customers?filter=email$eq:' + email)
            .then(getFirstRecord)
            .then(updateOrCreate);

        function getFirstRecord(response) {
            if (response && response.collection && response.collection.length > 0) {
                return response.collection[0];
            }
        }

        function updateOrCreate(existingCustomer){
            if (existingCustomer) {
                return promiseUpdateCustomer(existingCustomer.customerNumber, customer);
            } else {
                return promiseCreateCustomer(customer);
            }
        }
    }

    return {
        promiseCreateOrUpdateCustomer: promiseCreateOrUpdateCustomer
    }
}

exports.CustomersModule = CustomersModule;