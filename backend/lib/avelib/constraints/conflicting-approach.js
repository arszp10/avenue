module.exports = {
    secondaryFlowSaturationFlowRate:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 100000
        }
    },
    edges: {
        presence: true,
        arraySize: {
            equal: 2
        }
    }
};