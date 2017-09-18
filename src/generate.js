"use strict";

import utils from "./utils.js";
import DEFAULTS from "./generate/DEFAULTS.js";

import Scheme from "./classes/Scheme.js";

let generate = {
	Line: function(options) {

		options = DEFAULTS.line.merge(arguments[0]);

		if (options.rhyme) {
			console.log("rhyme here");
		}
		else {
			console.log("no rhyme here");
			if (options.limitType === "syllable") {

			}
		}
	},

	Lines: function(options) {

		// options = DEFAULTS.lines.merge(arguments[0]);

		options = utils.mergeDeep(DEFAULTS.lines, options);

		var currentScheme;

		if (options.rhyme) {

			currentScheme = new Scheme(options.scheme.string);

			if (currentScheme.scheme.length < options.linesCount) {
				currentScheme.expand(options.linesCount, options.scheme.keep);
			}
			else if (currentScheme.scheme.length > options.linesCount) {
				currentScheme.shorten(options.linesCount);
			}

		}

		this.text = "";

		for (let i = 0; i < options.linesCount; i++) {

			var lineOptions = options.line;

			lineOptions.index = i;

			if (options.rhyme) {
				lineOptions.rhyme = currentScheme.scheme[i];
			}

			this[i] = new lapid.generate.Line(lineOptions);

			this.text += this[i].text + "\n";
		}

	}
};

export default generate;
