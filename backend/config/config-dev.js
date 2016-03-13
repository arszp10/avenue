module.exports = {
   database: 'mongodb://localhost/avenue-dev',
   session: function(store){
       return {
           secret: 'This is a secret',
           resave: false,
           saveUninitialized: true,
           cookie: {
                maxAge: 60000 * 60 * 24 * 7 // 1 week
           },
           store: store
       }
   }

};