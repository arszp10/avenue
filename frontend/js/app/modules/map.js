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


    App.Modules.map = {
        Map: map,
        MapView: view,
        Classes: {
            Extent: {}
        },

        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
        },
        initModule: function(){
            var that = this;
            if (typeof require == 'undefined') {
                return;
            }
            $(document).ready(function(){
                require([
                    "esri/Map",
                    "esri/views/MapView",
                    "esri/geometry/Extent",
                    "esri/geometry/SpatialReference",
                    "esri/widgets/Search",
                    "esri/widgets/Compass",
                    "esri/widgets/Zoom",
                    "esri/widgets/Locate",
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
                        center: [30.318474, 59.908733],
                        scale: 1128,
                        constraints: {
                            minScale: 140,
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

                });
            });
        },

        hideWidgets:function() {
            view.ui.empty('top-left');
            view.ui.empty('top-right');
            view.ui.empty('bottom-right');
            view.ui.empty('bottom-left');
        },

        showWidgets:function(){
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

