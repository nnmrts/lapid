"use strict";

import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

let Line = function(options) {

	options = utils.mergeDeep(DEFAULTS.line, options);

	if (options.rhyme) {
		console.log("rhyme here");
	}
	else {
		console.log("no rhyme here");
		if (options.limitType === "syllable") {

		}
	}
};

export default Line;
