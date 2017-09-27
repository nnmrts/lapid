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

export default weightedRandom;
