module.exports = {

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