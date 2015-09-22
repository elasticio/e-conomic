module.exports = {
    flatten: makeObjectFlatten,
    unflatten: makeObjectUnflatten,
    getRefWithPath: getRefWithPath,
    removeEmptyValues: removeEmptyValues
};

/**
 * Remove all null, empty string (''), empty object ({}), empty array ([]) properties from an object
 */
function removeEmptyValues(obj){

    for (var key in obj) {
        if (obj[key] === null || obj[key] === '') {
            delete obj[key];
        }
        if (typeof obj[key] === 'object') {
            // recursive clean of child object
            obj[key] = removeEmptyValues(obj[key]);
            // delete child object if empty
            if (Object.keys(obj[key]).length === 0) {
                delete obj[key];
            }
        }
    }
    return obj;
}

/**
 * Return value of field with given path in given object
 * If path couldn't be resolved return null
 * @param {Object} obj
 * @param {String} path
 * @returns {Object|null}
 */
function getRefWithPath(obj, path) {
    var keys = path.split(".");
    var curr = obj;
    for (var i = 0; i < keys.length; i++) {
        if (!curr[keys[i]]) {
            return null;
        } else {
            curr = curr[keys[i]];
        }
    }
    return curr;
}

function makeObjectFlatten(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for (var i=0, l=cur.length; i<l; i++) {
                 recurse(cur[i], prop + "[" + i + "]");
             }
            if (l == 0){
                result[prop] = [];
            }
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop) {
                result[prop] = {};
            }
        }
    }
    recurse(data, "");
    return result;
}

function makeObjectUnflatten(data) {
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
}