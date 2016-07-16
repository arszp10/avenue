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
    };

    Array.prototype.minIndex3 = function () {
        var a = this;
        if (a[0] < a[1]) {
            if (a[0] < a[2]) { return 0;}
            return 2;
        } else {
            if (a[1] < a[2]) { return 1;}
            return 2;
        }
    }


};