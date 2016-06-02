var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var Schema = mongoose.Schema;


var maxlength = [200, 'The value of field `{PATH}` `{VALUE}` exceeds the maximum allowed length ({MAXLENGTH}).'];
var minlength = [3, 'The value of field `{PATH}` `{VALUE}` less the minimum allowed length ({MINLENGTH}).'];
var required = [true, 'Please enter your {PATH}.'];

var userSchema = new Schema({
    fullName:  { type: String, required: required, maxlength: maxlength, minlength: minlength },
    email:     { type: String, required: required, unique: true, maxlength: maxlength, minlength: minlength },
    password:  { type: String, required: required, minlength: minlength },
    passwordHash:  { type: String, required: required, minlength: minlength },
    salt:      { type: String, required: true },
    apiKey:    { type: String, required: true, unique: true },
    apiSecret: { type: String, required: true },
    admin: Boolean,
    active: Boolean,
    activationKey: String,
    location: String,
    createdAt: Date,
    updatedAt: Date,
    models : [{ type: Schema.Types.ObjectId, ref: 'Model' }]
});

userSchema.plugin(uniqueValidator);

userSchema.pre('validate', function(next) {
    var currentDate = new Date();
    this.updatedAt = currentDate;
    if (! this.createdAt) {
        var apikey = this.email;
        var apisec = this.genSalt();
        this.salt = this.genSalt();
        this.active = true;
        this.activationKey =  this.encryptPassword(apikey + apisec);
        this.createdAt = currentDate;
        this.passwordHash  = this.encryptPassword(this.password);
        this.apiKey    = this.encryptPassword(apikey).substr(0, 10);
        this.apiSecret = this.encryptPassword(apisec).substr(0, 10);
    }
    next();
});

userSchema.pre('save', function(next) {
    if (this.password !== '********') {
        this.password = '********';
    }
    next();
});


userSchema.methods.genSalt = function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
};

userSchema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

userSchema.methods.authenticate = function(plainText) {
    return this.encryptPassword(plainText) === this.passwordHash;
};


var User = mongoose.model('User', userSchema);


module.exports = User;