module.exports = {
    interTact: {
        red: {
            length: 6,
            signals: [
                {
                    color: 'red',
                    length: 3
                },
                {
                    color: 'amber',
                    length: 3
                }
            ]
        },
        green: {
            length: 6,
            signals: [
                {
                    color: 'blink',
                    length: 3
                },
                {
                    color: 'yellow',
                    length: 3
                }
            ]
        }
    },

    offsetOptimizationSteps: function(Tc) {
        var c = [0.4, 0.3, 0.2, 0.1, 0.05, 0.3, 0.2, 0.1, 0.05]; // + 2, 1
        var r = c.map(function(v){ return Math.round(Tc * v);});
            r.push(2); r.push(1);
        return r;
    }
};