$(document).ready(function(event){

    var notifyErrors = function(data){
        data.forEach(function(v){
            $.notify(v.message, {
                elementPosition: 'top right',
                style: 'bootstrap',
                className: 'error'
            })
        })
    };

    var helpBlockErrors = function(container, data){
        $(container).find('.help-block').remove();
        $(container).find('.has-error').removeClass('has-error');
        data.forEach(function(v){
            $(container).find('[name="'+v.path+'"]').parent()
                .append('<div class="help-block">'+v.message+'</div>')
                .addClass('has-error');
        })
    };


    var $post = function(url, data, form, redirect){
        var jqxhr = $.post(url, data, null, 'json')
            .done(function(res) {
                if (res.result) {
                    window.location = redirect
                } else {
                    helpBlockErrors(form, res.data);
                }
            })
            .fail(function() {
                notifyErrors([{message: 'Unexpected error, please mail to support!'}]);
            });
    };

    $('input[type="checkbox"]').iCheck({
        checkboxClass: 'icheckbox_minimal-blue'
    });

    $('#sign-up-form').submit(function(){
        var data = {};
        var th = $(this);
        $(this).serializeArray().map(function(v){ data[v.name] = v.value; });
        $post("/api/user/sign-up", data, th, "welcome");
        return false;
    });

    $('#reset-password-form').submit(function(){

        return false;
    });

    $('#sign-in-form').submit(function(){
        var data = {remember: 'off'};
        var th = $(this);
        $(this).serializeArray().map(function(v){ data[v.name] = v.value; });
        console.log(data);
        $post("/api/user/sign-in", data, th, "/app");
        return false;
    });
});
