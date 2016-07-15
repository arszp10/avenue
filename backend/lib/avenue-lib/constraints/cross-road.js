module.exports = {
    id: {
        presence: true
    },
    cycleLength:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 40,
            lessThanOrEqualTo: 600
        }
    },
    offset:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0
        },
        lessThanField: 'cycleLength'
    },
    phases: {
        presence: true,
        arraySize: {
            min: 2,
            max: 8
        },
        sumPhases: true
    }
};
