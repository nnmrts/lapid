import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

import Syllable from "./Syllable.js";
import Word from "./Word.js";

import language from "../language.js";

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
		if (options.limitType === "syllable") {

		}
	}

	/**
	 * Actually generates the line.
	 * @function
	 * @returns {string} the text of the line.
	 */
	const generate = function() {
		let text = "";

		let currentNgram = utils.weightedRandom(language.startNgrams[options.word.ngram.limit])();

		let ngramRe = new RegExp(currentNgram, "g");

		let match = [];

		for (let i = 0; i < options.limit; i++) {
			while ((match = (ngramRe.exec(language.text))) !== null) {
				const possibility = language.text.substring(match.index + currentNgram.length, (match.index + currentNgram.length) + 1);

				if (!language.ngrams[options.word.ngram.limit]) {
					language.ngrams[options.word.ngram.limit] = {};
				}
				if (!language.ngrams[options.word.ngram.limit][currentNgram]) {
					language.ngrams[options.word.ngram.limit][currentNgram] = {};
				}
				if (!language.ngrams[options.word.ngram.limit][currentNgram][possibility]) {
					language.ngrams[options.word.ngram.limit][currentNgram][possibility] = 1;
				}
				else {
					language.ngrams[options.word.ngram.limit][currentNgram][possibility] += 1;
				}
			}

			const possibilites = language.ngrams[options.word.ngram.limit][currentNgram];

			if (!possibilites) {
				break;
			}

			const next = utils.weightedRandom(possibilites)();

			text += next;

			currentNgram = text.substring(text.length - options.word.ngram.limit, text.length);

			ngramRe = new RegExp(currentNgram, "g");

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

						// for (let i = 0; i < language.text.length - options.word.ngram.limit; i++) {
						// 	const ngram = language.text.substring(i, i + options.word.ngram.limit);

						// 	if (!language.ngrams[options.word.ngram.limit]) {
						// 		language.ngrams[options.word.ngram.limit] = {};
						// 	}
						// 	if (!language.ngrams[options.word.ngram.limit][ngram]) {
						// 		language.ngrams[options.word.ngram.limit][ngram] = {};
						// 	}
						// 	if (!language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)]) {
						// 		language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)] = 1;
						// 	}
						// 	else {
						// 		language.ngrams[options.word.ngram.limit][ngram][language.text.charAt(i + options.word.ngram.limit)] += 1;
						// 	}

						// 	if (i % 10000 === 0) {
						// 		console.log(`worked through ${i} characters`);
						// 	}
						// }

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

export default Line;
