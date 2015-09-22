var _ = require('lodash');
var elastic = require('elasticio-node');
var objectUtilities = elastic.ObjectUtilities;

/**
 * Creates a product
 * If error E06010 (product exists) received - updates a product
 */

function ProductsModule(client) {

    function promiseCreateOrUpdateProduct(body, cfg){

        var product = buildProduct(body, cfg);

        return promiseCreateProduct(product).fail(onCreateError);

        function onCreateError(err) {
            if (err.json.errorCode === 'E06010' && product.productNumber) {
                return promiseUpdateProduct(product.productNumber, product);
            } else {
                throw err;
            }
        }
    }

    function buildProduct(body, cfg){

        var product =  _.clone(objectUtilities.removeEmptyValues(body));

        product.barred = false;

        // set default productGroupNumber from cfg
        if (!product.productGroup || !product.productGroup.productGroupNumber) {
            product.productGroup = product.productGroup || {};
            product.productGroup.productGroupNumber = cfg.productGroupNumber;
        }

        if (product.costPrice) {
            product.costPrice = parseFloat(product.costPrice);
        }
        if (product.recommendedPrice) {
            product.recommendedPrice = parseFloat(product.recommendedPrice);
        }
        if (product.salesPrice) {
            product.salesPrice = parseFloat(product.salesPrice);
        }
        if (product.productGroup.productGroupNumber) {
            product.productGroup.productGroupNumber =
                parseInt(product.productGroup.productGroupNumber, 10);
        }
        if (product.unit && product.unit.unitNumber) {
            product.unit.unitNumber = parseInt(product.unit.unitNumber, 10);
        }

        return product;
    }

    function promiseCreateProduct(product){
        console.log('Create product');
        return client.post('products', product);
    }

    function promiseUpdateProduct(productNumber, product){
        console.log('Update product');
        return client.put('products/' + productNumber, product);
    }

    return {
        buildProduct: buildProduct,
        promiseCreateOrUpdateProduct: promiseCreateOrUpdateProduct
    }
}

exports.ProductsModule = ProductsModule;
