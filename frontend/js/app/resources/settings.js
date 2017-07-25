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
            maxZoom: 2.0,
            //wheelSensitivity:20,
            layout: {
                name: 'preset',
                fit: true
            }
        },
        cyCrossroadCopy: {
            hideEdgesOnViewport: true,
            hideLabelsOnViewport: true,
            textureOnViewport: true,
            pixelRatio: 1,
            motionBlur: true,
            boxSelectionEnabled:false,
            userPanningEnabled:true,
            //elements: [],
            showOverlay: false,
            minZoom: 0.1,
            maxZoom: 2.0,
            layout: {
                name: 'preset',
                fit: true,
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
        }
    };
})(AvenueApp.Resources);
