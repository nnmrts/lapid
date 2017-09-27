const joinLoop = function(array, string, index = 0) {
	let text = "";

	let i = index;

	if (i < array.length) {
		text += array[i];

		i += 1;

		joinLoop();
	}

	return text;
};

export default joinLoop;
