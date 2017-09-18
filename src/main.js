"use strict";

import generate from './generate.js';
import process from './process.js';

(function() {
	var childProcess = require("child_process");
	var oldSpawn = childProcess.spawn;

	function mySpawn() {
		console.log('spawn called');
		console.log(arguments);
		var result = oldSpawn.apply(this, arguments);
		return result;
	}
	childProcess.spawn = mySpawn;
})();

// HELPER FUNCTIONS

// ---------------------

let lapid = function() {
	this.LANGUAGE = "de";
	this.generate = generate;
	this.process = process;
};

export default lapid;
