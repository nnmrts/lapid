"use strict";

import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

import Ngram from "./Ngram.js";

let Word = function(options) {

	options = utils.mergeDeep(DEFAULTS.word, options);

	this.text = "";

	for (let i = 0; i < options.limit; i++) {
		var ngramOptions = {
			index: i,
			wordIndex: options.index,
			lineIndex: options.lineIndex
		};

		this[i] = new Ngram(ngramOptions);

		this.text += this[i].text;
	}

};

export default Word;
