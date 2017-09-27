/**
 *
 *
 * @param {any} string
 */
const Scheme = class {
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
	static expand(linesCount, keep) {
		if (keep) {
			const addition = this.scheme.length - linesCount;

			for (let i = 0; i < addition; i++) {
				let currentIndex = i;

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
	static shorten(linesCount) {
		this.scheme.splice(linesCount);
	}
};

export default Scheme;
