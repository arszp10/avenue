var validate = require('validate.js');

module.exports = {
   minLength: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}

        if (parseInt(attributes.length) < value) {
            return "must be less or equal phase length = " + attributes.length;
        }
        if (value < options) {
            return "must be greater or equal than " + options
        }
        return undefined;
   },

    arraySize: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}

        if (options.equal !== undefined && value.length != options.equal) {
            return "array length must be equal "+ options.equal
        }

        if (options.min !== undefined && value.length < options.min) {
            return "length must be greater or equal than "+ options.min
        }
        if (options.max !== undefined && value.length > options.max) {
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

    arrayOfBool: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}
        if (!validate.isArray(value)) {
            return "must be Array of Boolean. Ex: [true, false, true]";
        }
        var i = value.length;
        while (i--){
            if (value[i] !== true && value[i] !== false) {
                return "must be Array of Boolean. Ex: [true, false, true]";
            }
        }
        return undefined;
    },

    lessThanField: function(value, options, key, attributes) {
        if (validate.isEmpty(value)) {return;}

        if (value >= parseInt(attributes[options])) {
            return " must be less than "+ attributes[options]
        }
        return undefined;
    },

    parentPresence: function(value, options, key, attributes) {
        if (validate.isEmpty(value) && validate.isEmpty(attributes.parent)) {
            return "can not be blank if parent node doesn't specified."
        }
        return undefined;
    },

    sizeAndOrder: function(value, options, key, attributes) {
        if (!validate.isEmpty(attributes.parent)) {return;}
        if (!validate.isArray(attributes.intervals)) {
            return "must be Array of Array[2]. Ex: [[0,10], [20,40]]";
        }
        var intervals = attributes.intervals;
        var prevEnd = -1;
        var v0 = 0, v1 =0;
        for (var i = 0; i < intervals.length; i++){
            if (intervals[i].length != 2) {
                return "item[" + i + "], must be Array[2]. Ex: [0,10]";
            }
            v0 = parseInt(intervals[i][0]);
            v1 = parseInt(intervals[i][1]);
            if (v1 <= v0) {
                return "item[" + i + "], second value must be greater than first. Ex: [0, 10]";
            }
            if (v0 <= prevEnd) {
                return "item[" + i + "], first value must be greater than prev second. Ex: ..., 10], [20,...";
            }
            prevEnd = v1;
        }
        var i  = intervals.length-1;
        v1 = parseInt(intervals[i][1]);
        if (v1 >= parseInt(attributes.cycleTime)) {
            return "item[" + i + "], second value must be less than Cycle Time (" + attributes.cycleTime + "). Ex: ..., 40]]";
        }

        return undefined;
    }
};