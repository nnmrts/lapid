import "babel-polyfill/dist/polyfill.min.js";

import generate from "./generate.js";
import process from "./process.js";
import language from "./language.js";

const lapid = {
	generate,
	process,
	language,

	/**
	 * init function for lapid
	 * @param {any} languageId iso languae code
	 */
	init: (languageId) => {
		lapid.language.id = languageId;
		lapid.language.getLanguage();
	}
};

window.lapid = lapid;

export default lapid;
