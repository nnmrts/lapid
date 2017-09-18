"use strict";

import generate from './generate.js';
import process from './process.js';

// HELPER FUNCTIONS

// ---------------------

let lapid = function() {
	this.LANGUAGE = "de";
	this.generate = generate;
	this.process = process;
};

export default lapid;
