module.exports = {
    id: {
        presence: true
    },
    cycleTime:{
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
        lessThanCycleTime: true
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
