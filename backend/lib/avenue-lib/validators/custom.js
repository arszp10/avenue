var validate = require('validate.js');

module.exports = {
   minLength: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}
        if (parseInt(attributes.length) < value) {
            return "must be less or equal phase length = " + attributes.length;
        }
        if (value < options) {
            return "must be more or equal than " + options
        }
        return undefined;
   },

    arraySize: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}

        if (value.length < options.min) {
            return "length must be more or equal than "+ options.min
        }
        if (value.length > options.max) {
            return "length must be less or equal than"+ options.max
        }
        return undefined;
    },

    sumPhases: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}

        var sum = 0;
        attributes.phases.map(function(v){
            sum += parseInt(v.length);
        });

        if (sum != attributes.cycleTime) {
            return "amount length must be equal CycleTime = " + attributes.cycleTime
        }
        return undefined;
    },

    lessThanCycleTime: function(value, options, key, attributes) {
        if (value >= parseInt(attributes.cycleTime)) {
            return " must be less than "+ attributes.cycleTime
        }
        return undefined;
    }
};