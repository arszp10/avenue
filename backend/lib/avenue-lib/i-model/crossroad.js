function CrossRoad(options){
    this.options = options;
    this.calc = function (){

    };

    this.json = function json() {
        return {
            id: this.id,
            cycleTime: this.options.cycleTime
        }
    };

}
module.exports = CrossRoad;
