module.exports = {
    routeTime: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 6000
        }
    },
    length: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 10000
        }
    },

    dispersion: {
        presence: true,
        numericality: {
            onlyInteger: false,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    }
}