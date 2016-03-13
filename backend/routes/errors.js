module.exports = function(app){
    app.use(function(req, res, next){
        res.status(404);
        if (req.accepts('html')) {
            res.sendFile('errors/404.html', {root: __dirname + '/../public'});
            return;
        }
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }
        res.type('txt').send('Not found');
    });


    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.sendFile('errors/500.html', {root: __dirname + '/../public'});
    });


    app.get('/404', function(req, res, next){
        next();
    });

    app.get('/403', function(req, res, next){
        var err = new Error('not allowed!');
        err.status = 403;
        next(err);
    });

    app.get('/500', function(req, res, next){
        next(new Error('keyboard cat!'));
    });
};

