"use strict";

import utils from "./utils.js";
import DEFAULTS from "./generate/DEFAULTS.js";

Line = function(options) {

		options = DEFAULTS.line.merge(arguments[0]);

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

	