module.exports = function() {

    Array.prototype.fillArray = function (len, value) {
        return Array.apply(null, Array(len)).map(Number.prototype.valueOf, value);
    };

    Array.prototype.last = function () {
        if (this.length > 0) {
            return this[this.length - 1];
        }
        return false;
    };

    Array.prototype.first = function () {
        if (this.length > 0) {
            return this[0];
        }
        return false;
    };

    Array.prototype.sum = function () {
        var total = 0;
        var i = this.length;
        while (i--) {
            total += this[i];
        }
        return total;
    }
};