const DEFAULTS = {};

DEFAULTS.letter = {

};

DEFAULTS.ngram = {
	limit: 5,
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

export default DEFAULTS;
