/**
 * lapid - natural language generation and processing done right
 * @version v1.3.3
 * @link https://github.com/nnmrts/lapid
 * @license Unlicense
 */

"use strict";

require('babel-polyfill/dist/polyfill.min.js');

const getJSON = function(url, fullfilled, rejected) {
	window.fetch(url).then(response => response.json()).then((json) => {
		fullfilled(json);
	}, (reason) => {
		if (typeof rejected === "undefined") {
			console.error(reason);
		}
		else {
			rejected(reason);
		}
	});
};

const postJSON = function(
	url, json, fullfilled, rejected
) {
	window.fetch(url, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "POST",
		body: json
	}).then((response) => {
		if (typeof fullfilled !== "undefined") {
			fullfilled(response);
		}
	}, (reason) => {
		if (typeof rejected === "undefined") {
			console.error(reason);
		}
		else {
			rejected(reason);
		}
	});
};

const isObject = function(item) {
	return (item && typeof item === "object" && !Array.isArray(item));
};

// deep merge objects
// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
// authors: @salakar, @cpill

const mergeDeep = function(target, source) {
	const output = Object.assign({}, target);
	if (utils.isObject(target) && utils.isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (utils.isObject(source[key])) {
				if (!(key in target)) {
					Object.assign(output, {
						[key]: source[key]
					});
				}
				else {
					output[key] = mergeDeep(target[key], source[key]);
				}
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

// pick random value based on weights
// https://stackoverflow.com/a/8435261/5707534
// author: @maerics

const weightedRandom = function(spec) {
	const table = [];

	Object.keys(spec).forEach((key, i) => {
		// The constant 10 below should be computed based on the
		// weights in the spec for a correct and optimal table size.
		// E.g. the spec {0:0.999, 1:0.001} will break this impl.

		for (let j = 0; j < spec[i] * 10; j++) {
			table.push(i);
		}
	});

	return function() {
		return table[Math.floor(Math.random() * table.length)];
	};
};

const utils = {
	getJSON,
	postJSON,
	isObject,
	mergeDeep,
	weightedRandom
};

const DEFAULTS = {};

DEFAULTS.letter = {

};

DEFAULTS.ngram = {
	limit: 4,
	letter: DEFAULTS.letter
};

DEFAULTS.syllable = {
	ngram: DEFAULTS.ngram
};

DEFAULTS.word = {
	limit: 5,
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
	limit: 25,
	limitType: "letter",
	syllable: DEFAULTS.syllable,
	word: DEFAULTS.word
};

DEFAULTS.text = {
	sentence: DEFAULTS.sentence
};

DEFAULTS.lines = {
	limit: 4,
	rhyme: false,
	scheme: {
		keep: true,
		string: "aabb"
	},
	line: DEFAULTS.line
};

let Letter = function(options) {

	options = utils.mergeDeep(DEFAULTS.letter, options);

	this.text = "a";

	// for (let i = 0; i < options.limit; i++) {

	// 	this[i] = new Letter();

	// 	this.text += this[i].text;
	// }

};

// import store from "../store.js";

const Ngram = function(options) {
	options = utils.mergeDeep(DEFAULTS.ngram, options);

	this.text = "";

	if (options.index === 0 && options.wordIndex === 0 && options.lineIndex === 0) {
		for (let i = 0; i < store.text.length - options.limit; i++) {
			const ngram = store.text.substring(i, i + options.limit);

			if (!store.weightedNgrams[ngram]) {
				store.weightedNgrams[ngram] = 1;
			}
			else {
				store.weightedNgrams[ngram]++;
			}

			if (!store.markovChain[ngram]) {
				store.markovChain[ngram] = {};
			}
			if (!store.markovChain[ngram][store.text.charAt(i + options.limit)]) {
				store.markovChain[ngram][store.text.charAt(i + options.limit)] = 1;
			}
			else {
				store.markovChain[ngram][store.text.charAt(i + options.limit)]++;
			}
		}

		this.text = utils.weightedRandom(store.weightedNgrams)();

		store.ngrams = this.text;

		store.ngramsArray = [this.text];
	}
	else {
		const possibilites = store.markovChain[store.ngramsArray[options.index - 1]];

		if (possibilites) {
			const nextLetter = utils.weightedRandom(possibilites)();

			store.ngrams += nextLetter;

			const currentNgram = store.ngrams.substring(store.ngrams.length - (options.limit), store.ngrams.length);

			this.text = currentNgram;

			store.ngramsArray.push(currentNgram);
		}
		// else {
		// 	this.text = " ";
		// }
	}
};

let Syllable = function() {
	return "swag";
};

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

const language = {
	ngrams: {

	},
	startNgrams: {

	},

	getLanguage: async() => {
		for (let i = 1; i <= 10; i++) {
			await utils.getJSON(`/language/${language.id}/${i}.json`, (languageJSON) => {
				language.ngrams[i] = languageJSON.ngrams;
				language.startNgrams[i] = languageJSON.startNgrams;
			});
		}
	},

};

/**
 * Initiates the generation of a line.
 *
 * @param {object} newOptions An object representing options for generating a line.
 * @param {function} resolve A typical resolve function of promises.
 */
const Line = function(newOptions, resolve) {
	const options = utils.mergeDeep(DEFAULTS.line, newOptions);

	if (options.rhyme) {
		console.log("rhyme here");
	}
	else {
		console.log("no rhyme here");
		
	}

	/**
	 * Actually generates the line.
	 * @function
	 * @returns {string} the text of the line.
	 */
	const generate = function() {
		let text = utils.weightedRandom(language.startNgrams[options.word.ngram.limit])();

		let currentNgram = text;

		for (let i = 0; i < options.limit; i++) {
			const possibilites = language.ngrams[options.word.ngram.limit][currentNgram];

			if (!possibilites) {
				break;
			}

			const next = utils.weightedRandom(possibilites)();

			text += next;

			currentNgram = text.substring(text.length - options.word.ngram.limit, text.length);

			// var syllableOrWordOptions = {
			// 	index: i,
			// 	lineIndex: options.index
			// };

			// if (options.limitType === "syllable") {
			// 	scope[i] = new Syllable(syllableOrWordOptions);

			// }

			// if (options.limitType === "word") {
			// 	scope[i] = new Word(syllableOrWordOptions);

			// }

			// scope.text += scope[i].text + " ";
		}

		console.log(`line ${options.index} finished`);

		resolve();

		return text;
	};

	if (language.corpus) {
		this.text = generate();
	}
	else {
		utils.getJSON("../../corpora/de.json", (corpus) => {
			console.time();

			language.corpus = corpus;

			language.text = "";

			let corpusIndex = 0;

			const loop = function() {
				setTimeout(() => {
					if (corpusIndex < corpus.length) {
						language.text += `${language.corpus[corpusIndex]} `;

						const ngram = language.corpus[corpusIndex].substring(0, options.word.ngram.limit);

						if (!language.startNgrams[options.word.ngram.limit]) {
							language.startNgrams[options.word.ngram.limit] = {};
						}

						if (!language.startNgrams[options.word.ngram.limit][ngram]) {
							language.startNgrams[options.word.ngram.limit][ngram] = 1;
						}
						else {
							language.startNgrams[options.word.ngram.limit][ngram] += 1;
						}

						corpusIndex += 1;

						if (corpusIndex % 100 === 0) {
							console.log(`concatenated ${corpusIndex} sentences`);
						}

						loop();
					}
					else {
						console.log("TIME");
						console.timeEnd();

						language.text += language.corpus[corpusIndex];

						for (let i = 0; i < language.text.length - options.word.ngram.limit; i++) {
							const ngram = language.text.substring(i, i + options.word.ngram.limit);

							if (!language.ngrams[options.word.ngram.limit]) {
								language.ngrams[options.word.ngram.limit] = {};
							}
							if (!language.ngrams[options.word.ngram.limit][ngram]) {
								language.ngrams[options.word.ngram.limit][ngram] = {};
							}
							if (!language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)]) {
								language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)] = 1;
							}
							else {
								language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)] += 1;
							}

							if (i % 10000 === 0) {
								console.log(`worked through ${i} characters`);
							}
						}

						this.text = generate();
					}
				}, 1);

				// return language.text;
			};

			loop();

			// language.text = language.corpus.join(" ");
		});
	}
};

/**
 *
 *
 * @param {any} string
 */
const Scheme = class {
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
			const addition = this.scheme.length - linesCount;

			for (let i = 0; i < addition; i++) {
				let currentIndex = i;

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

const generate = {
	Letter,
	Ngram,
	Syllable,
	Word,
	Line,
	Lines
};

let process = {

};

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

module.exports = lapid;
