module.exports = {
   baseUrl: process.env.BASE_URL || 'http://localhost:9000',
   database: process.env.MONGODB_PATH || 'mongodb://localhost/avenue-dev',
   mailTransportOptions: {
       service: 'Gmail',
       auth: {
           user: 'avenue.2.0.robot@gmail.com',
           pass: process.env.GMAIL_ACCOUNT_PASSWORD
       }
   },
   emailTemplates: {
        activation: {
            from: 'avenue.2.0.robot@gmail.com', // sender address
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