function CrossRoad(options){
    this.options = options;
    this.offset = parseInt(options.offset);
    this.cycleLength = parseInt(options.cycleLength);
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
            cycleLength: this.cycleLength,
            phases: this.phases
        }
    };

}
module.exports = CrossRoad;
