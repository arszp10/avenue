var isJson = /application\/json/;

module.exports = function(app){
    app.use(function(req, res, next){
        res.status(404);
        if(isJson.test(req.get('accept'))) {
            res.json( { success: false,  message: 'Resource not found',  data: {code: 404} });
            return;
        }

        res.sendFile('errors/404.html', {root: __dirname + '/../public'});
    });

    app.use(function (error, req, res, next) {
        if (error instanceof SyntaxError) {
            res.json( { success: false,  message: 'Invalid JSON request',  data: {code: 500} });
            return;
        } else {
            next();
        }
    });

    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        console.log(err);
        if(isJson.test(req.get('accept'))) {
            res.json( { success: false,  message: 'Internal server error',  data: {code: 500} });
            return;
        }

        res.sendFile('errors/500.html', {root: __dirname + '/../public'});
    });

};

