module.exports = {
    travelTime: {
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

    platoonDispersion: {
        presence: true,
        numericality: {
            onlyInteger: false,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    }
};