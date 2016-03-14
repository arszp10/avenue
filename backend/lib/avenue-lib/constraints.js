var constraintsNode = {
    id: {
        presence: true
    },
    nodeType: {
        presence: true,
        inclusion: {
            within: ['crossRoad', 'stopline', 'carriageway', 'point', 'bottleneck', 'concurrent', 'concurrentMerge'],
            message: "^ Node type not supported"
        }
    },
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
    },
    routeTime:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 6000
        }
    },
    length:{
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 10000
        }
    },

    dispersion:{
        presence: true,
        numericality: {
            onlyInteger: false,
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    }
};


var constraintsEdge = {
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



