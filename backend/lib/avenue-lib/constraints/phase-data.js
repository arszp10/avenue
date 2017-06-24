module.exports = {
    tag: {
        presence: true,
        length: {maximum: 50}
    },
    length: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 8,
            lessThanOrEqualTo: 600
        }
    },
    minLength: {
        presence: true,
        numericality: {
            onlyInteger: true,
        },
        minLength: 8
    },
    intertact: {
        //presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 3,
        },
        lessThanField: 'minLength'
    }
};
