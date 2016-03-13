var User = require('./models/user');

module.exports = function(app) {

    app.post('/api/user/sign-up', function (req, res) {
        var newUser = User(req.body);
        newUser.save(function (err) {
            if (err) {
                var errors = [];
                _.forIn(err.errors, function (v, k) {
                    errors.push({path: v.path, message: v.message});
                });
                res.json({
                    result: false,
                    message: err.message,
                    data: errors
                });
                return;
            }
            res.json({
                result: true,
                message: 'User successfully created!',
                data: []
            });
        });
    });

    app.post('/api/user/sign-in', function (req, res) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (user && user.authenticate(req.body.password)) {
                req.session.user_id = user.id;
                req.session.user_name = user.fullName;
                req.session.user_email = user.email;
                res.json({
                    result: true,
                    message: 'User login successfully!',
                    data: []
                });
            } else {
                res.json({
                    result: false,
                    message: 'User invalid credentials!',
                    data: [
                        {path: 'email', message: 'Invalid email'},
                        {path: 'password', message: '... or Password.'}
                    ]
                });
            }
        });
    });


    app.post('/api/user/reset-password', function (req, res) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (user) {
                res.json({
                    result: true,
                    message: 'Password recovery instructions sent successfully!',
                    data: []
                });
            } else {
                res.json({
                    result: false,
                    message: 'User invalid credentials!',
                    data: [{path: 'email', message: 'Sorry, but we doesn\'t have such email'}]
                });
            }
        });
    });

    app.post('/api/model/validate', function (req, res) {
        res.json({
            result: true,
            message: 'Success !!',
            data: []
        });
    });

}