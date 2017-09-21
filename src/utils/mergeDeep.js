"use strict";

import utils from "../utils.js";

// deep merge objects
// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
// authors: @salakar, @cpill

let mergeDeep = function(target, source) {

	let output = Object.assign({}, target);
	if (utils.isObject(target) && utils.isObject(source)) {

		Object.keys(source).forEach(key => {
			if (utils.isObject(source[key])) {

				if (!(key in target))
					Object.assign(output, {
						[key]: source[key]
					});
				else
					output[key] = mergeDeep(target[key], source[key]);
			}
			else {
				Object.assign(output, {
					[key]: source[key]
				});
			}
		});
	}
	return output;
};

export default mergeDeep;
