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
    sumOfOutterEdges : function (sum){
        return  {
            avgIntensity:{
                numericality: {
                    onlyInteger: true,
                    greaterThanOrEqualTo: sum,
                    notGreaterThanOrEqualTo: 'should be great or equal than the sum of intensities of outgoing edges.'
                }
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
    },

    nodesCycleTimeEqual: function (){
        return {
            'source.cycleTime': {
                equality: 'target.cycleTime'
            }
        }
    }


};