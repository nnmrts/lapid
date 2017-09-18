"use strict";

/**
 * 
 * 
 * @param {any} string 
 */
let Scheme = class {
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
	get expand(linesCount, keep) {
		if (keep) {
			let addition = this.scheme.length - linesCount;

			for (let i = 0; i < addition; i++) {
				var currentIndex = i;

				if (i + 1 > this.scheme.length) {
					currentIndex = i - this.scheme.length;
				}

				this.scheme.push(this.scheme[currentIndex]);
			}
		}
		else {
			for (let i = 0; i < linesCount; i++) {

			}
		}

	}

	/**
	 * 
	 * 
	 * @param {any} linesCount 
	 * @readonly
	 */
	get shorten(linesCount) {
		this.scheme.splice(linesCount);
	}

};

export default Scheme;
