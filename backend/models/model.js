var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var maxlength  = [200, 'The value of field `{PATH}` `{VALUE}` exceeds the maximum allowed length ({MAXLENGTH}).'];
var minlength  = [3, 'The value of field `{PATH}` `{VALUE}` less the minimum allowed length ({MINLENGTH}).'];
var required   = [true, 'Please enter your {PATH}.'];

var modelSchema = new Schema({
    name:       { type: String, required: required, maxlength: maxlength, minlength: minlength },
    notes:      { type: String },
    content:            Object,
    cycleTime:  { type: Number, required: required},
    crossCount: { type: Number, required: required},
    nodeCount:  { type: Number, required: required},
    createdAt:          Date,
    updatedAt:          Date,
    _creator :  { type: Schema.Types.ObjectId, ref: 'User' }
});


modelSchema.pre('validate', function(next) {
    var currentDate = new Date();
    this.updatedAt = currentDate;
    if (! this.createdAt) {
        this.cycleTime = 100;
        this.crossCount = 0;
        this.nodeCount = 0;
        this.createdAt = currentDate;
    }
    next();
});


var Model = mongoose.model('Model', modelSchema);
module.exports = Model;