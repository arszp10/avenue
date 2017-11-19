var _ = require('lodash');

module.exports = {

    prepareTracksForCalc: function(track1, track2, dist){
        var t1 = JSON.parse(JSON.stringify(track1));
        var t2 = JSON.parse(JSON.stringify(track2));

        if (t1[0].x > t2[0].x) {
            for(var i = t1[0].x - 1 ; i >= t2[0].x; i-- ){
                t1.unshift({x:i, y:0});
            }
        } else {
            for(var i = t2[0].x - 1; i >= t1[0].x; i-- ){
                t2.unshift({x:i, y:0});
            }
        }

        var l1 = t1.length-1;
        var l2 = t2.length-1;

        if (t1[l1].x > t2[l2].x) {
            for(var i = t2[l2].x ; i < t1[l1].x; i++ ){
                t2.push({x:i, y:dist});
            }
        } else {
            for(var i = t1[l1].x; i < t2[l2].x; i++ ){
                t1.push({x:i, y:dist});
            }
        }
        return [t1,t2];
    },


    trackShift: function trackShift(track, single) {
        var delta = track[0].x - single[0].x;
        single.map(function(p){
            p.x = p.x + delta;
        });
        return single;
    },

    metricSquare: function metricSquare(track1, track2, dist) {
        var tracks = this.prepareTracksForCalc(track1, track2, dist);
        var t1 = tracks[0];
        var t2 = tracks[1];
        var ms1 = 0;
        for(var i = 0; i < t1.length; i++ ){
            ms1 = ms1 + Math.abs(t1[i].y - t2[i].y);
        }
        return ms1;
    },


    vectorByMinSqareNeighborhoodOfTrack: function(single, traces, distance, neighborhood, stopLine, singleInx){
        var that = this;
        var offset = 1;
        var offsetThreshold = neighborhood; ///3600/(1.5*q) ;
        var minSquare = 100000000000000;
        var minSinx  = -1;
        _.forEach(traces, function(trace, inx){
            offset = Math.abs(trace[0].x-single[0].x);
            if ( offset > offsetThreshold || ! that.hasStops(trace, distance)) {
                return;
            }
            var square = that.metricSquare(trace, single, distance);

            if (minSquare < 0 || square < minSquare) {
                minSquare = square;
                minSinx = inx;
            }
        });
        if (minSinx < 0) {
           return that.emptyVector();
        }
        return that.paramsVector(traces[minSinx], single, distance, minSquare, stopLine, minSinx, singleInx);
    },


    stopTanAngle: function (stopPoint, intervals, dist){
        for(var i = 0; i < intervals.length; i++ ){
            var interval = intervals[i];
            if (stopPoint.x >= interval[0] && stopPoint.x <= interval[1] ){

                var tan =  (dist-stopPoint.y)/(stopPoint.x - interval[0] + 1);
                //console.log(dist, stopPoint.y,stopPoint.x,interval, tan);
                return tan;
            }
        }
        return 0;
    },

    paramsVector: function paramsVector(track1, track2, dist, square, stopLine, minSinx, singleInx) {
        //track2 =  this.trackShift(track1, track2);

        var tracks = this.prepareTracksForCalc(track1, track2, dist);
        var t1 = tracks[0];
        var t2 = tracks[1];
        var ms2 = 0;
        var ms3 = 0;
        var st1 = 0;
        var st2 = 0;
        var sl1 = 0;
        var sl2 = 0;
        var tan1 = 0;
        var tan2 = 0;
        var p1 = true;
        var p2 = true;

        for(var i = 0; i < t1.length; i++ ){
            var r2a=0, r2b = 0, r3a=0, r3b = 0;
            if (i > 0) {
                var isT1Corner = t1[i].y == 0 || t1[i].y == dist;
                var isT2Corner = t2[i].y == 0 || t2[i].y == dist;

                if (t1[i].y == t1[i-1].y){
                    r2a = dist - t1[i].y;
                    if(!isT1Corner){
                        r3a = dist - t1[i].y;
                        st1 ++;
                        sl1 += r3a;
                        if (p1) {
                            tan1 += this.stopTanAngle(t1[i], stopLine.intervals, dist);
                            p1 = false;
                        }
                    }

                } else {
                    p1 = true;
                }
                if (t2[i].y == t2[i-1].y){
                    r2b = dist - t2[i].y;
                    if(!isT2Corner) {
                        r3b = dist - t2[i].y;
                        st2 ++;
                        sl2 += r3b;
                        if (p2) {
                            tan2 += this.stopTanAngle(t2[i], stopLine.intervals, dist);
                            p2 = false;
                        }
                    }

                } else {
                    p2 = true;
                }
                ms2 = ms2 + Math.sqrt((Math.abs(r2a*r2a - r2b*r2b)));
                ms3 = ms3 + Math.sqrt((Math.abs(r3a*r3a - r3b*r3b)));
            }
        }
        return {
            i1: minSinx,
            i2: singleInx,
            s1: square,
            s2: ms2,
            s3: ms3,
            v1: dist/this.routeTime(track1),
            v2: dist/this.routeTime(track2),
            rt1: this.routeTime(track1),
            rt2: this.routeTime(track2),
            st1: st1,
            st2: st2,
            sl1: sl1,
            sl2: sl2,
            tan1: Math.atan(tan1)*180/Math.PI,
            tan2: Math.atan(tan2)*180/Math.PI
        };
    },

    evklid: function (v){
        return Math.sqrt(v.s1 +
            Math.pow(v.v1-v.v2, 2) +
            Math.pow(v.rt1-v.rt2, 2) +
            Math.pow(v.st1-v.st2,2) +
            Math.pow(v.sl1-v.sl2,2) +
            Math.pow(v.tan1-v.tan2,2)
        );
    },

    emptyVector: function (){
      return false;
    },

    smoothing: function smoothing(data, N){
        return data.map(function(arr){
            var s = 0;
            var c = 0;
            var i = arr.length-1;
            do {
                s = s + arr[i];
                i--;
                c++;
            } while (i>=0 && c < N);
            return (s/c);
        });
    },

    routeTime: function(trace){
        return (trace[trace.length-1].x - trace[0].x);
    },

    hasStops: function(trace, distance){
        var vfr = 13.8889;
        var tfr = distance/vfr + 1;
        var tpr = (trace[trace.length-1].x - trace[0].x);
        return tpr > tfr;
    },

    ideal:function(x, qx){
        if (qx == 100) return -1;
        if (qx == 1000) return -1;
        if (x == qx) return 0;
        if (x < qx) return (qx-x)/(qx-100);
        if (x > qx) return (x-qx)/(1000-qx);
    }


};