(function(App){
    var controls  = App.Controls;

    App.Modules.controls = {
        injectDependencies: function(modules) {},
        initModule: function(){
            $.each(controls.panels,  function(i,v){controls.panels[i]  = $(v);});
            $.each(controls.buttons, function(i,v){controls.buttons[i] = $(v);});
            $.each(controls.inputs,  function(i,v){controls.inputs[i]  = $(v);});
            $.each(controls.labels,  function(i,v){controls.labels[i]  = $(v);});
        }
    };

})(AvenueApp);

