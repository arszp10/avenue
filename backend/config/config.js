module.exports = {
   appPath: process.env.APP_PATH,
   baseUrl: process.env.BASE_URL,
   database: process.env.MONGODB_PATH,

   urlEncodedMiddlewareOptions: {
        limit: "50mb",
        extended: true,
        parameterLimit:50000
   },

   mailerOptions: {
       apiKey: process.env.MAILGUN_API_KEY,
       domain: 'avenue-app.com',
       from: 'AvenueApp <robot@avenue-app.com>'
   },

   emailsSettings: {
       activationEmail: {
            subject: 'Activate your Avenue 2.0 account',
            template: '/backend/resources/emails/activation-email.html.twig'
        },
       passResetEmail:{
           subject: 'Reset password for your Avenue 2.0 account',
           template: '/backend/resources/emails/reset-password-email.html.twig'
       },
       newPasswordEmail:{
           subject: 'New password for your Avenue 2.0 account',
           template: '/backend/resources/emails/new-password-email.html.twig'
       }
   },

   session: function(store){
       return {
           secret: 'This is a secret',
           resave: false,
           saveUninitialized: true,
           cookie: { maxAge: 60000 * 60 * 24 * 7 }, // 1 week
           store: store
       }
   }

};