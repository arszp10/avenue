function CrossRoad(options, network){
    this.options = options;
    this.calc = function (){

    };

    this.json = function json() {
        return {
            cicleTime: this.options.cicleTime,
        }
    };

}
module.exports = CrossRoad;
