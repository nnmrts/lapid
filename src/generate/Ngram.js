import utils from "../utils.js";
import DEFAULTS from "./DEFAULTS.js";

import Letter from "./Letter.js";

import store from "../store.js";

const Ngram = function(options) {
	options = utils.mergeDeep(DEFAULTS.ngram, options);

	this.text = "";

	if (options.index === 0 && options.wordIndex === 0 && options.lineIndex === 0) {
		for (let i = 0; i < store.text.length - options.limit; i++) {
			let ngram = store.text.substring(i, i + options.limit);

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
			let nextLetter = utils.weightedRandom(possibilites)();

			store.ngrams += nextLetter;

			let currentNgram = store.ngrams.substring(store.ngrams.length - (options.limit), store.ngrams.length);

			this.text = currentNgram;

			store.ngramsArray.push(currentNgram);
		}
		// else {
		// 	this.text = " ";
		// }
	}
};

export default Ngram;
