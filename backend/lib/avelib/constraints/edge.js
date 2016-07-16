module.exports = {
    target: {
        presence: true
    },
    source: {
        presence: true
    },
    portion:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 100000
        }
    }
};



