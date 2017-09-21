/**
 * lapid - natural language generation and processing done right
 * @version v1.0.24
 * @link https://github.com/nnmrts/lapid
 * @license Unlicense
 */

"use strict";

let isObject = function(item) {
	return (item && typeof item === "object" && !Array.isArray(item));
};

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

let utils = {
	isObject,
	mergeDeep
};

let DEFAULTS = {};

DEFAULTS.ngram = {
	letter: DEFAULTS.letter
};

DEFAULTS.syllable = {
	ngram: DEFAULTS.ngram
};

DEFAULTS.word = {
	ngram: DEFAULTS.ngram,
};

DEFAULTS.sentence = {
	limit: 7,
	limitType: "word",
	syllable: DEFAULTS.syllable,
	word: DEFAULTS.word
};

DEFAULTS.line = {
	index: 0,
	rhyme: null,
	limit: 7,
	limitType: "syllable",
	syllable: DEFAULTS.syllable,
	word: DEFAULTS.word
};

DEFAULTS.text = {
	sentence: DEFAULTS.sentence
};

DEFAULTS.lines = {
	linesCount: 4,
	rhyme: false,
	scheme: {
		keep: true,
		string: "aabb"
	},
	line: DEFAULTS.line
};

let Line = function(options) {

	options = utils.mergeDeep(DEFAULTS.line, options);

	if (options.rhyme) {
		console.log("rhyme here");
	}
	else {
		console.log("no rhyme here");
		
	}
};

/**
 * 
 * 
 * @param {any} string 
 */
let Scheme = class {
	constructor(string) {
		this.string = string;
		this.scheme = string.split("");
	}

	/**
	 * 
	 * 
	 * @param {any} linesCount 
	 * @param {any} keep 
	 * @readonly
	 */
	static expand(linesCount, keep) {
		if (keep) {
			let addition = this.scheme.length - linesCount;

			for (let i = 0; i < addition; i++) {
				var currentIndex = i;

				if (i + 1 > this.scheme.length) {
					currentIndex = i - this.scheme.length;
				}

				this.scheme.push(this.scheme[currentIndex]);
			}
		}
		else {
			
		}

	}

	/**
	 * 
	 * 
	 * @param {any} linesCount 
	 * @readonly
	 */
	static shorten(linesCount) {
		this.scheme.splice(linesCount);
	}

};

let Lines = function(options) {

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

};

let generate = {
	Line,
	Lines
};

let process = {

};

let _lapid = {
	LANGUAGE: "de",
	generate,
	process
};

window.lapid = _lapid;

module.exports = _lapid;
