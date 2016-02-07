(function($){
    $.fn.drag = function(o){
        var o = $.extend({
            start:function(){},   // при начале перетаскивания
            stop:function(){} // при завершении перетаскивания
        }, o);
        return $(this).each(function(){
            var d = $(this); // получаем текущий элемент
            d.mousedown(function(e){ // при удерживании мыши
                $(document).unbind('mouseup'); // очищаем событие при отпускании мыши
                o.start(d); // выполнение пользовательской функции
                d.css('position','absolute');
                var f = d.offset(), // находим позицию курсора относительно элемента
                    x = e.pageX - f.left,  // слева
                    y = e.pageY - f.top;  // и сверху
                $(document).mousemove(function(a){ // при перемещении мыши
                    d.css({'top' : a.pageY - y + 'px','left' : a.pageX - x + 'px'}); // двигаем блок
                });
                return false;
            });
            $(document).mouseup(function(){  // когда мышь отпущена
                $(document).unbind('mousemove'); // убираем событие при перемещении мыши
                o.stop(d); // выполнение пользовательской функции
            });
        });
    }
})(jQuery);