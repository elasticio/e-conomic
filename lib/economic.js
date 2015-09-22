var API_BASE_URI = 'https://restapi.e-conomic.com';

exports.createRequestOptions = createRequestOptions;
exports.createHeaderOptions = createHeaderOptions;

function createHeaderOptions (cfg) {
    var applicationIdentifier = process.env.ECONOMIC_PRIVATE_APP_ID;
    var accessId = cfg.accessId;

    return {
        headers: {
            appId: applicationIdentifier,
            accessId: accessId,
            Accept : '*/*'
        }
    }
}

/**
 * It generate query hash based on account cfg, current snapshot date and needed data section as path
 *
 * @param cfg
 * @param snapshot - {lastChecked}
 * @param path - e.g. 'customers', 'invoices/booked'
 * @returns {{uri: string, headers: {appId: *, accessId: (*|configuration.accessId)}, json: boolean}}
 */
function createRequestOptions(cfg, path, snapshot) {

    var applicationIdentifier = process.env.ECONOMIC_PRIVATE_APP_ID;
    var accessId = cfg.accessId;
    var query;
    var filterProp;

    filterProp = path.indexOf('invoice') !== -1 ? 'date' : 'lastUpdated';

    if (snapshot){
        // TODO: remove 'pagesize' param after API update
        query = '?filter=' + filterProp + '$gt:' + snapshot.lastChecked + '&pagesize=999';
    } else {
        query = '';
    }

    return {
        uri: API_BASE_URI + '/' + path + query,
        headers: {
            appId: applicationIdentifier,
            accessId: accessId
        },
        json : true
    };
}
