var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var maxlength  = [200, 'The value of field `{PATH}` `{VALUE}` exceeds the maximum allowed length ({MAXLENGTH}).'];
var minlength  = [3, 'The value of field `{PATH}` `{VALUE}` less the minimum allowed length ({MINLENGTH}).'];
var required   = [true, 'Please enter your {PATH}.'];

var modelSchema = new Schema({
    name:       { type: String, required: required, maxlength: maxlength, minlength: minlength },
    notes:      { type: String },
    content:    Object,
    routes:     Object,
    cycleTime:  { type: Number, required: required},
    crossCount: { type: Number, required: required},
    nodeCount:  { type: Number, required: required},
    createdAt:          Date,
    updatedAt:          Date,
    position:      Object,
    anchored:      { type: Boolean },
    showMapInBackground:{ type: Boolean },
    intertactOrder: { type: String },
    defaultIntensity:  { type: Number},
    defaultCapacity:  { type: Number},
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
        this.intertactOrder = 'after';
        this.defaultIntensity = 600;
        this.defaultCapacity = 1800;
    }
    next();
});


var Model = mongoose.model('Model', modelSchema);

Model.findWithPages = function(p, ready){
    var params = Object.assign({
        page:  1,
        limit: 10,
        text:  '',
        orderBy: '-updatedAt'
    }, p);
    params.text = params.text + '';

    if (['-updatedAt', 'updatedAt'].indexOf(params.orderBy) == -1) {
        params.orderBy = '-updatedAt';
    }

    if (params.page > 1000) { params.page = 1000; }
    if (params.page < 1) { params.page = 1; }

    if (params.limit > 100) { params.limit = 100; }
    if (params.limit < 10)  { params.limit = 10; }
    if (params.text.length < 2)  { params.text = '' }

    var conditions = {_creator: p.userId};
    if (params.text.length > 0) {
        conditions.name = { $regex: '.*' + params.text + '.*' };
    }

    var skip = (params.page - 1) * params.limit;
    this.find(conditions).
        skip(skip).limit(params.limit).
        sort(params.orderBy).
        select('_id name nodeCount crossCount cycleTime createdAt updatedAt').
        exec(function(err, data){
            if (err) {
                ready(err, null);
                return;
            }
            this.count(conditions, function(err, c){
                var totalPagesM1 = Math.ceil(c/params.limit) - 1 ;
                var result = {
                    page: params.page > totalPagesM1 ? totalPagesM1 : params.page,
                    start: skip + 1,
                    finish: skip + data.length,
                    total: c,
                    table: data
                };
                ready(null, result);
                return;
            });
        }.bind(this));
    return;
};


module.exports = Model;