module.exports = function(app){
    app.use(function(req, res, next){
        res.status(404);
        if(/application\/json/.test(req.get('accept'))) {
            res.json({
                "code": 404,
                "message": "Resource not found"
            });
        } else {
            res.sendFile('errors/404.html', {root: __dirname + '/../public'});
        }
    });

    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        if(/application\/json/.test(req.get('accept'))) {
            res.json({
                "code": 500,
                "message": "Internal server error"
            });
        } else {
            res.sendFile('errors/500.html', {root: __dirname + '/../public'});
        }


    });

};

