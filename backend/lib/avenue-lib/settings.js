module.exports = {
    cyNodeProps: {
        data: {},
        position:{
            x: 0,
            y: 0
        },
        group:"nodes",
        removed:false,
        selected:false,
        selectable:true,
        locked:false,
        grabbable:true,
        classes:''
    },

    cyEdgeProps: {
        data: {},
        position:{ },
        group:"edges",
        removed:false,
        selected:false,
        selectable:true,
        locked:false,
        grabbable:true,
        classes:''
    },

    edge: {
        id: '',
        portion: 0,
        source: '',
        target: ''
    },
    crossRoad: {
        icon: '',
        type: 'crossRoad',
        name: '',
        cycleTime: 100,
        offset: 10,
        phases: [
            {
                tag: 'ph-1',
                length: 50,
                minLength: 15,
                intertact: 6
            },
            {
                tag: 'ph-2',
                length: 50,
                minLength: 15,
                intertact: 6
            }
        ]
    },
    stopline: {
        icon: '\u0051',
        type: 'stopline',
        tag: '',
        color: 'primary',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        intervals: [[0,20], [40,55]],
        greenPhases: [true, false],
        additionalGreens: [0, 0],
        weight: 1,
        queueLimit: 0

    },
    carriageway:{
        icon:'\uf0ec',
        type: 'carriageway',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        routeTime: 20,
        length: 300,
        dispersion: 0.5,
        weight: 1,
        queueLimit: 0
    },
    point: {
        icon: '\uf22d',
        type: 'point',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        weight: 1,
        queueLimit: 0
    },
    bottleneck: {
        icon: '\uf0b0',
        type: 'bottleneck',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 2000,
        weight: 1,
        queueLimit: 0
    },
    concurrent: {
        icon: '\uf074',
        type: 'concurrent',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        secondaryFlowCapacity: 1800,
        weight: 1,
        queueLimit: 0
    },
    concurrentMerge: {
        icon: '\uf126',
        type: 'concurrentMerge',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        secondaryFlowCapacity: 1800,
        weight: 1,
        queueLimit: 0
    },

    interPhaseDefaults:{
        amber: 3,
        blink: 3,
        yellow: 3,
        totalLength: 6
    },

    offsetOptimizationSteps: function(Tc) {
        var c = [0.4, 0.3, 0.2, 0.1, 0.05, 0.3, 0.2, 0.1, 0.05]; // + 2, 1
        var r = c.map(function(v){ return Math.round(Tc * v);});
            r.push(2); r.push(1);
        return r;
    }
};