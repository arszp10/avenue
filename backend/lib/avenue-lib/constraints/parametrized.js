module.exports = {
    stoplineExtra : function (parentsIds, phasesLenght){
        return {
            parent: {
                inclusion:parentsIds
            },
            greenPhases: {
                arraySize: {
                    equal: phasesLenght
                },
                arrayOfBool: true
            }
        };
    },

    edgeExtra : function (ids){
        return {
            target: {
                inclusion:ids
            },
            source: {
                inclusion:ids
            }
        };
    }
};