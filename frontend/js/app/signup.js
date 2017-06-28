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
        if (res.success) {
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
        return formSubmit($(this), 'signIn', '/models');
    });

    var hash = window.location.hash;
    if (hash == '#activation-success') {
        $.notify(
            $('#sign-in-form'),
            'Your account has been activated. Go in!', 
             {className: 'success', elementPosition: 'top center', autoHide: false}
        );
    }
    if (hash == '#activation-failed') {
        $.notify(
            $('#sign-in-form'),
            'Your account activation failed, please ask support about.',
            {className: 'error', elementPosition: 'top center', autoHide: false}
        );
    }
    if (hash == '#reset-password-success') {
        $.notify(
            $('#sign-in-form'),
            'The new password sent to your email. Please check it and sign in.', 
            {className: 'success', elementPosition: 'top center', autoHide: false}
        );
    }
    if (hash == '#reset-password-failed') {
        $.notify(
            $('#sign-in-form'),
            'Your password reset failed, please ask support about.', 
            {className: 'error', elementPosition: 'top center', autoHide: false}
        );
    }



});

