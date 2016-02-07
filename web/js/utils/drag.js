(function($){
    $.fn.drag = function(o){
        var o = $.extend({
            start:function(){},
            stop:function(){},
            head: '.chart-panel-head',
            close: 'a.btn-chart-close'
        }, o);
        return $(this).each(function(){
            var d = $(this);
            d.find(o.close).click(
                function(){
                    d.remove();
                }
            );
            d.find(o.head).mousedown(function(e){
                //$(document).unbind('mouseup');
                o.start(d);
                d.css('position','absolute');
                var f = d.offset(),
                    x = e.pageX - f.left,  // слева
                    y = e.pageY - f.top;  // и сверху
                $(document).mousemove(function(a){
                    d.css({'top' : a.pageY - y + 'px','left' : a.pageX - x + 'px'});
                });
                return false;
            });
            $(document).mouseup(function(){
                $(document).unbind('mousemove');
                o.stop(d);
            });
        });
    }
})(jQuery);