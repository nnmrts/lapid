"use strict";

import generate from './generate.js';
import process from './process.js';

let _lapid = {
	LANGUAGE: "de",
	generate,
	process
};

window.lapid = _lapid;

export default _lapid;
