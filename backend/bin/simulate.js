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

var fileName = process.argv[2];
var contents = fs.readFileSync(fileName, 'utf8');
var requestBodyData = _.cloneDeepWith(JSON.parse(contents), coerce);

requestBodyData = requestBodyData.data;

var errors = avenueLib.validate(requestBodyData);
if (errors.length > 0) {
    console.log(JSON.stringify(responses.modelValidationFailed(errors)));
    return;
}

console.log(
    JSON.stringify(
        responses.modelSimulationSuccess(
            avenueLib.simulate(requestBodyData)
        )
    )
);