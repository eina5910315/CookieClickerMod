Game.registerMod("force eng number format mod", {
	init: function () {
		//this function is called as soon as the mod is registered
		//declare hooks here

		//note: this mod does nothing but show a notification at the bottom of the screen once it's loaded
		Game.Notify(`force eng number format mod loaded!`, '', [16, 5]);
	},
	save: function () {
		//use this to store persistent data associated with your mod
	},
	load: function (str) {
		//do stuff with the string data you saved previously
	},
});
function Beautify(val, floats) {
	var negative = (val < 0);
	var decimal = '';
	var fixed = val.toFixed(floats);
	if (Math.abs(val) < 1000 && floats > 0 && Math.floor(fixed) != fixed) decimal = '.' + (fixed.toString()).split('.')[1];
	val = Math.floor(Math.abs(val));
	if (floats > 0 && fixed == val + 1) val++;
	var format = 1;
	var formatter = numberFormatters[format];
	var output = (val.toString().indexOf('e+') != -1 && format == 2) ? val.toPrecision(3).toString() : formatter(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	if (output == '0') negative = false;
	return negative ? '-' + output : output + decimal;
}
