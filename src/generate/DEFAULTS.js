"use strict";

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

export default DEFAULTS;
