function CrossRoad(options, network){
    this.options = options;
    this.calc = function (){

    };

    this.json = function json() {
        return {
            cycleTime: this.options.cycleTime,
        }
    };

}
module.exports = CrossRoad;
