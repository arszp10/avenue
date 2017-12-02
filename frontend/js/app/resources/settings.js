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
            desktopTapThreshold:4,
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
                    fillColor: "rgba(110,110,110,0.1)",
                    strokeColor: "rgba(110,110,110,0.51)",
                    pointColor: "rgba(110,110,110,0.51)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(110,110,110,0.51)",
                    data: data
                };
            },
            flowOut: function(data){
                return {
                    label: "flow out",
                    fillColor: "rgba(51,122,183,0.15)",
                    strokeColor: "rgba(51,122,183,0.51)",
                    pointColor: "rgba(51,122,183,0.51)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(51,122,183,0.51)",
                    data: data
                };
            },
            queueFunc: function(data){
                return {
                    label: "queue",
                    fillColor: "rgba(250,80,80,0.05)",
                    strokeColor: "rgba(250,80,80,0.5)",
                    pointColor: "rgba(250,80,80,0.5)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(250,80,80,0.5)",
                    data: data
                };
            }
        },

        crossRoad: {
            icon: '',
            type: 'crossRoad',
            name: 'Default intersection',
            optimizeOff: false,
            width: 50,
            height: 50,
            vehicleSpeed: 36,
            pedestrianSpeed: 5,
            programs: [],
            currentProgram: null
        },

        emptyProgram:{
            name: 'Morning #1',
            cycleTime: 100,
            offset: 0,
            phases: [],
            phasesOrders: [],
            currentOrder: -1
        },

        programDefaults:{
            name: 'Morning #1',
            cycleTime: 100,
            offset: 0,
            phases: [
                {
                    tag: 'ph1',
                    length: 50,
                    minLength: 12,
                    intertact: 3
                },
                {
                    tag: 'ph2',
                    length: 50,
                    minLength: 12,
                    intertact: 3
                }
            ],
            phasesOrders: [
                {
                    name: 'master',
                    order: [1, 2]
                },
                {
                    name: 'reserve',
                    order: [3, 4]
                }
            ],
            currentOrder: 0
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
            greenPhases: [[false, false]],
            additionalGreens: [[0, 0]],
            weight: 1,
            queueLimit: 0

        },
        carriageway:{
            icon:'\u0079',
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
            icon: '\u0071',
            type: 'point',
            tag: '',
            cycleTime: 100,
            avgIntensity: 900,
            capacity: 1800,
            weight: 1,
            queueLimit: 0
        },
        bottleneck: {
            icon: '\u0076',
            type: 'bottleneck',
            tag: '',
            cycleTime: 100,
            avgIntensity: 900,
            capacity: 2000,
            weight: 1,
            queueLimit: 0
        },
        concurrent: {
            icon: '\u0067',
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
            icon: '\u0068',
            type: 'concurrentMerge',
            tag: '',
            cycleTime: 100,
            avgIntensity: 900,
            capacity: 1800,
            secondaryFlowCapacity: 1800,
            weight: 1,
            queueLimit: 0
        },

        pedestrian: {
            icon: '\u0064',
            type: 'pedestrian',
            tag: '',
            cycleTime: 100,
            avgIntensity: 900,
            capacity: 1800,
            weight: 1,
            queueLimit: 0,
            intervals: [[0,20], [40,55]],
            greenPhases: [[true, true, true, true,true, true,true, true,true, true, true, true]],
            additionalGreens: [[0, 0]],
        },

        interPhaseDefaults:{
            amber: 2,
            blink: 3,
            yellow: 3,
            totalLength: 3
        },


        pedestrianInterPhaseDefaults:{
            amber: 0,
            blink: 3,
            yellow: 0,
            totalLength: 3
        },

        emptyPhase: {
            tag: '',
            length: 0,
            minLength: 12,
            intertact: 3
        },

        pedEdge: {
            speed: 5,
            distance: 20
        },

        vehEdge: {
            speed: 50,
            distance: 100
        },

        crossEdge: {
            speed: 23,
            distance: 50
        },

    };
})(AvenueApp.Resources);
