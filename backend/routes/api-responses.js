var _ = require('lodash');

function errObj(s, m, d){
    return { success: s,  message: m,  data: d };
}

module.exports = {

    wrongCredentials: function(){
        return errObj(false, 'Wrong api_key and api_secret combination',{'code': 401 });
    },
    pong: function(){
        return errObj(true, 'Pong', []);
    },


    fieldsErrorsList: function(err, data){
        var errors = [];
        _.forIn(err.errors, function (v, k) {
            errors.push({path: v.path, message: v.message});
        });
        return errObj(false, err.message, errors);
    },
    entityCreatedSuccessfully: function(e, data){
        return errObj(true, e +' successfully created!', data);
    },
    entityUpdatedSuccessfully: function(e, data){
        return errObj(true, e +' successfully updated!', data);
    },
    entityNotFound: function(e, id){
        return errObj(false, e + ' with id ' + id + ' is not found!', []);
    },

    entityFound: function(e, id, d){
        return errObj(true, e +' id = ' + id , d);
    },

    entityRemoved: function(e, id, d){
        return errObj(true, e +' with id = ' + id + ' has ben removed.' , d);
    },

    entityListFound: function(e, cnt, d){
        return errObj(true, e +' list ' + cnt + ' items found.' , d);
    },



    userLoginSuccessfully: function(){
        return errObj(true, 'User login successfully!', []);
    },
    userLoginFailed: function(){
        return {
            result: false,
            message: 'User invalid credentials!',
            data: [
                {path: 'email', message: 'Invalid email'},
                {path: 'password', message: '... or Password.'}
            ]
        }
    },


    modelValidationFailed: function(e){
        return errObj(false, 'The model failed a validation!', e);
    },
    modelSimulationSuccess: function(d){
        return errObj(true, 'Simulation was successful!', d);
    }



};