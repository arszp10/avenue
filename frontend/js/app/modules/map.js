(function(App){

    var cy, map;
    var view;
    var search,compass, zoom, locate;
    //<!--22, 141-->
    //<!--21, 282-->
    //<!--20, 564-->
    //<!--19, 1128-->
    //<!--18, 2256-->
    //<!--17, 4513-->
    //<!--16, 9027-->

    var defaultExtent = {
        xmax:4187606.8252613014,
        xmin:4186931.432456595,
        ymax:7510382.427749333,
        ymin:7509888.572886829,
        spatialReference: {
            wkid: 102100
        }
    };

    App.Modules.map = {
        Map: map,
        MapView: view,
        Classes: {
            Extent: null
        },

        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
        },
        initModule: function(){
            var that = this;
            if (typeof require == 'undefined') {
                return;
            }
            require([
                "esri/Map",
                "esri/views/MapView",
                "esri/geometry/Extent",
                "esri/geometry/SpatialReference",
                "esri/widgets/Search",
                "esri/widgets/Compass",
                "esri/widgets/Zoom",
                "esri/widgets/Locate"
            ], function(Map, MapView, Extent, SpatialReference, Search, Compass, Zoom, Locate){
                that.Classes.Extent = Extent;
                that.Classes.Compass = Compass;
                that.Classes.Zoom = Zoom;
                that.Classes.Search = Search;
                that.Classes.Locate = Locate;

                map  = new Map({basemap: "hybrid"});
                view = new MapView({
                    container: "mapBack",
                    map: map,
                    //extent: new Extent(extent),
                    //scale: scale,
                    constraints: {
                        minScale: 1,
                        maxScale: 9028
                    },
                    resizeAlign: 'top-left'
                });
                that.hideWidgets();
                view.on('resize', function(e){
                    setTimeout(function() {

                        if (!cy.cyBaseExtent) {
                            return;
                        }
                        cy.aveSetBaseExtent();
                        cy.trigger('viewport');
                    }, 1000);
                });

                that.Map = map;
                that.MapView = view;

                var pos = cy.aveGetExtents();
                that.mapSetExtentAndScale(pos);

            });
        },

        mapSetExtentAndScale: function (cyExt){
            if (! this.MapView) return;
            this.MapView.extent = new this.Classes.Extent(this.validExtent(cyExt.mapExtent));
            this.MapView.scale = parseInt(cyExt.mapScale) ? cyExt.mapScale : 1128;
        },

        validExtent: function(ext){
            if (!ext || !ext.xmin || !ext.xmax || !ext.ymin || !ext.ymax) {
                return defaultExtent;
            }
            return ext;
        },

        hideWidgets:function() {
            if (!view) return;
            view.ui.empty('top-left');
            view.ui.empty('top-right');
            view.ui.empty('bottom-right');
            view.ui.empty('bottom-left');
        },

        showWidgets:function(){
            if (!view) return;
            search = new this.Classes.Search({view: view});
            compass = new this.Classes.Compass({view: view});
            zoom = new this.Classes.Zoom({view: view});
            locate = new this.Classes.Locate({view: view});

            view.ui.add(search, "top-right");
            view.ui.add(zoom, "top-left");
            view.ui.add(compass, "bottom-left");
            view.ui.add(locate, "bottom-left");
        }
    };

})(AvenueApp);

