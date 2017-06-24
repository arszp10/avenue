module.exports = {
    //tag: {
    //    length: {maximum: 32}
    //},
    cycleTime:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 40,
            lessThanOrEqualTo: 600
        }
    },
    avgIntensity:{
        presence: true,
        lessThanField: 'capacity',
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 100000
        }
    },
    capacity:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 100000
        }
    },
    queueLimit:{
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 100000
        }
    },
    weight:{
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 1,
            lessThanOrEqualTo: 100000000
        }
    }
};