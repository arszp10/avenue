$(document).ready(function(event){

    var singUpApiWrapper = {
        calls: {
            signIn: ['POST', '/api/user/sign-in'],
            signUp: ['POST', '/api/user/sign-up'],
            resetPassword: ['POST', '/api/user/reset-password']
        },
        call: function(action, data, success, fail, options){
            if (! this.calls.hasOwnProperty(action)) {
                fail('Error: Unknown action called!');
            }

            var method = this.calls[action][0];
            var url = this.calls[action][1];

            return $.ajax({
                method: method,
                url: url,
                data: data,
                dataType: 'json'
            }).done(function(r){success(r, options);})
                .fail(function(r){fail(r, options);});
        }
    };

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


    var ajaxFormSubmit = function(res, options) {
        if (res.result) {
            window.location = options.redirect
        } else {
            helpBlockErrors(options.form, res.data);
        }
    };


    var unexpectedResponse = function() {
        notifyErrors([{message: 'Unexpected error, please mail to support!'}]);
    };


    var formSubmit = function(th, m, r){
        var data = {};
        th.serializeArray().map(function(v){ data[v.name] = v.value; });
        singUpApiWrapper.call(m, data, ajaxFormSubmit, unexpectedResponse, {redirect: r, form: th});
        return false;
    };

    $('input[type="checkbox"]').iCheck({
        checkboxClass: 'icheckbox_minimal-blue'
    });

    $('#sign-up-form').submit(function(){
        return formSubmit($(this),'signUp', 'welcome');
    });

    $('#reset-password-form').submit(function(){
        return formSubmit($(this), 'resetPassword', 'done');
    });

    $('#sign-in-form').submit(function(){
        return formSubmit($(this), 'signIn', '/app');
    });
});

