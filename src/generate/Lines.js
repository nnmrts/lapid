import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

import Scheme from "../classes/Scheme.js";

import Line from "./Line.js";

const Lines = function(newOptions) {
	return new Promise((resolveLines) => {
		const options = utils.mergeDeep(DEFAULTS.lines, newOptions);

		const lineOptions = {
			parent: (() => this)()
		};

		this.text = "";

		let currentScheme;

		if (options.rhyme) {
			currentScheme = new Scheme(options.scheme.string);

			if (currentScheme.scheme.length < options.limit) {
				currentScheme.expand(options.limit, options.scheme.keep);
			}
			else if (currentScheme.scheme.length > options.limit) {
				currentScheme.shorten(options.limit);
			}
		}

		console.log(`lines limit ${options.limit}`);

		(async() => {
			for (let i = 0; i < options.limit; i++) {
				lineOptions.finished = false;
				lineOptions.index = i;

				await new Promise((resolveLine) => {
					this[i] = new Line(lineOptions, resolveLine);
				}).then(() => {
					this.text += `${this[i].text}\n`;
				});
			}

			resolveLines(this);
		})();

		// if (options.limit > 0) {
		// 	this[0] = new Line(lineOptions);
		// }

		// if (!this.text) {}
		// else {

		// }

		// for (let i = 0; i < options.limit; i++) {

		// 	lineOptions.index = i;

		// 	if (options.rhyme) {
		// 		lineOptions.rhyme = currentScheme.scheme[i];
		// 	}

		// 	console.log(lineOptions);

		// 	this[i] = new Line(lineOptions);

		// 	this.text += this[i].text + "\n";
		// }
	});
};

export default Lines;
