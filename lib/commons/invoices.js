var _ = require('lodash-node');
var commons = require('./commons.js');

function InvoicesModule(client) {

    function buildInvoice(invoiceData, cfg){

        var invoice = _.clone(invoiceData);
        delete invoice.externalId;

        if (!_.isArray(invoice.lines) && _.isObject(invoice.lines)) {
            invoice.lines = _.values(invoice.lines);
        }

        invoice.paymentTerms = {
            self: "https://restapi.e-conomic.com/payment-terms/" + cfg.paymentTermId
        };

        if (invoice.layout && invoice.layout.layoutNumber) {
            invoice.layout.self = "https://restapi.e-conomic.com/layouts/" + invoice.layout.layoutNumber;
        }

        commons.checkFloatFields(invoice, [
            'netAmount',
            'grossAmount',
            'vatAmount',
            'currencyExchangeRate',
            'margin',
            'marginPercentage',
            'netAmountBaseCurrency',
            'roundingAmount',
            'deductionAmount'
        ]);

        commons.checkIntegerFields(invoice, [
            'attention'
        ]);

        commons.checkIntegerFields(invoice.layout, [
            'layoutNumber'
        ]);

        _.each(invoice.lines, function(line) {
            commons.checkFloatFields(line, [
                'unitNetPrice',
                'quantity',
                'discountPercentage'
            ]);
        });

        invoice.currency = invoice.currency || cfg.currency;

        return invoice;
    }

    function promiseCreateOrUpdateInvoice(invoiceData, cfg, idFromSnapshot) {

        var invoice = buildInvoice(invoiceData, cfg);

        if (idFromSnapshot) {
            console.log("Update invoice");
            return client.put('invoices/drafts/' + idFromSnapshot, invoice);
        } else {
            console.log("Create invoice");
            return client.post('invoices/drafts', invoice);
        }
    }

    return {
        promiseCreateOrUpdateInvoice: promiseCreateOrUpdateInvoice
    }

}

exports.InvoicesModule = InvoicesModule;
