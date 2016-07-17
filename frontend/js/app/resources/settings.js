(function(Resources){
    Resources.Settings = {
        cytoscape: {
            hideEdgesOnViewport: true,
            hideLabelsOnViewport: true,
            textureOnViewport: true,
            pixelRatio: 1,
            motionBlur: true,
            boxSelectionEnabled:true,
            userPanningEnabled:false,
            elements: [],
            showOverlay: false,
            minZoom: 0.1,
            maxZoom: 4.0,
            layout: {
                name: 'preset',
                fit: true
            }
        },

        chart: {
            common: {
                animation: false,
                showScale: true,
                bezierCurve : false,
                pointDot : false,
                scaleShowHorizontalLines: true,
                scaleShowVerticalLines: false,
                scaleOverride: false,
                scaleStepWidth: 20,
                scaleSteps: 0.1,
                scaleStartValue: 0,
                scaleLineWidth: 1,
                scaleShowLabels: true,
                scaleLabel: "<%=parseFloat(value).toFixed(2)%>",
                scaleIntegersOnly: false,
                scaleBeginAtZero: true,
                scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                scaleFontSize: 8,
                scaleFontStyle: "normal",
                scaleFontColor: "#999",
                showTooltips: false
            },
            labels: function(cT) {
                var module = cT > 100 ? 10 : 5;
                var labels = [];
                for (var i = 0; i < cT; i++) {
                    labels.push(i % module == 0 ? i : '');
                }
                return labels;
            },
            flowIn: function(data){
                return {
                    label: "flow in",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: data
                };
            },
            flowOut: function(data){
                return {
                    label: "flow out",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: data
                };
            }
        },

        intersection: {
            icon: '',
            type: 'intersection',
            name: '',
            cycleLength: 100,
            offset: 10,
            phases: [
                {
                    tag: 'ph-1',
                    length: 50,
                    minLength: 15
                },
                {
                    tag: 'ph-2',
                    length: 50,
                    minLength: 15
                }
            ]
        },
        stopline: {
            icon: '\u0051',
            type: 'stopline',
            tag: '',
            color: 'primary',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 1800,
            greenOffset1:0,
            greenOffset2:0,
            intervals: [[0,20], [40,55]],
            greenPhases: [true, false]
        },
        freeway:{
            icon:'\uf0ec',
            type: 'freeway',
            tag: '',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 1800,
            travelTime: 20,
            length: 300,
            platoonDispersion: 0.5
        },
        point: {
            icon: '\uf22d',
            type: 'point',
            tag: '',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 1800
        },
        bottleneck: {
            icon: '\uf0b0',
            type: 'bottleneck',
            tag: '',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 2000
        },
        conflictingApproach: {
            icon: '\uf074',
            type: 'conflictingApproach',
            tag: '',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 1800,
            secondaryFlowSaturationFlowRate: 1800
        },
        entranceRamp: {
            icon: '\uf126',
            type: 'entranceRamp',
            tag: '',
            cycleLength: 100,
            flowRate: 900,
            saturationFlowRate: 1800,
            secondaryFlowSaturationFlowRate: 1800
        },

        interTact: {
            red: {
                length : 6,
                signals : [
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
                length : 6,
                signals : [
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
        }
    };
})(AvenueApp.Resources);
