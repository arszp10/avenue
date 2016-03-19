module.exports = {
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
    }
};