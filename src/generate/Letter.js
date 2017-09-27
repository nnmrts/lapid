"use strict";

import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

let Letter = function(options) {

	options = utils.mergeDeep(DEFAULTS.letter, options);

	this.text = "a";

	// for (let i = 0; i < options.limit; i++) {

	// 	this[i] = new Letter();

	// 	this.text += this[i].text;
	// }

};

export default Letter;
