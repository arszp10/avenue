function CrossRoad(options){
    this.options = options;
    this.offset = parseInt(options.offset);

    this.calc = function (){

    };

    this.json = function json() {
        return {
            id: this.id,
            type: this.options.type,
            offset: this.offset,
            cycleTime: this.options.cycleTime
        }
    };

}
module.exports = CrossRoad;
