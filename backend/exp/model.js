var _ = require('lodash');
var fs = require('fs');
var avenueLib = require('../lib/avenue-lib');
var responses = require('../routes/api-responses');

var isint = /^[0-9]+$/;
var isfloat = /^([0-9]+)?\.[0-9]+$/;

function coerce(str) {
    if ('null' == str) return null;
    if ('true' == str) return true;
    if ('false' == str) return false;
    if (isfloat.test(str)) return parseFloat(str, 10);
    if (isint.test(str)) return parseInt(str, 10);
    return undefined;
}

module.exports = {
    simulate: function(jsonData){



        var requestBodyData = _.cloneDeepWith(jsonData, coerce);
        requestBodyData = requestBodyData.data;

        var errors = avenueLib.validate(requestBodyData);
        if (errors.length > 0) {
            throw new Error('Model validation failed'); return;
        }

        var result = avenueLib.simulate(requestBodyData);
        return result;
    }
};