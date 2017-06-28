var Twig    = require('twig');
var Mailgun = require('mailgun-js');
var config  = require('../config/config.js');

var mailgun = new Mailgun(config.mailerOptions);

module.exports = {

    sendMail: function(email, to, data){
        var appPath         = config.appPath;
        var emailOptions    = config.emailsSettings[email];
        var subj            = emailOptions.subject;
        var templatePath    = emailOptions.template;

        Twig.renderFile(
            appPath + templatePath,
            data,
            function(err, html){
                if (err) {
                    console.log("got an render error: ", err);
                    return false;
                }
                var mailData = {
                    from: config.mailerOptions.from,
                    to: to,
                    subject: subj,
                    html: html
                };
                mailgun.messages().send(mailData, function (err) {
                    if (err) { console.log("got an mailgun error: ", err); }
                });
            }
        )
    }
};