function CrossRoad(options){
    this.options = options;
    this.offset = parseInt(options.offset);
    this.cycleTime = parseInt(options.cycleTime);
    this.name = options.name;
    this.id = options.id;
    this.phases = options.phases;


    this.calc = function (){

    };

    this.json = function json() {
        return {
            id: this.id,
            type: this.options.type,
            offset: this.offset,
            cycleTime: this.cycleTime,
            phases: this.phases
        }
    };

}
module.exports = CrossRoad;
