module.exports = {
   baseUrl: 'http://localhost:9000',
   database: 'mongodb://avenue-prod:ghjcgtrn20@ds036709.mlab.com:36709/avenue-prod',
   mailTransportOptions: {
       service: 'Gmail',
       auth: {
           user: 'kuzinmv83@gmail.com',
           pass: ''
       }
   },
   emailTemplates: {
        activation: {
            from: 'kuzinmv83@gmail.com', // sender address
            to: '', // list of receivers
            subject: 'Activate your Avenue 2.0 account', // Subject line
            text: '',
            html: ' Activation link: <a href="{link}">{link}</a>' // You can choose to send an HTML body instead
        }
   },
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