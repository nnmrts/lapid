'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function (global, factory) {
	(typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.lapid = factory();
})(undefined, function () {
	'use strict';

	"use strict";

	var utils = {
		isObject: function isObject(item) {
			return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === "object" && !Array.isArray(item);
		},

		// deep merge objects
		// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
		// authors: @salakar, @cpill

		mergeDeep: function (_mergeDeep) {
			function mergeDeep(_x, _x2) {
				return _mergeDeep.apply(this, arguments);
			}

			mergeDeep.toString = function () {
				return _mergeDeep.toString();
			};

			return mergeDeep;
		}(function (target, source) {

			var output = Object.assign({}, target);
			if (utils.isObject(target) && utils.isObject(source)) {
				Object.keys(source).forEach(function (key) {
					if (utils.isObject(source[key])) {
						if (!(key in target)) Object.assign(output, _defineProperty({}, key, source[key]));else output[key] = mergeDeep(target[key], source[key]);
					} else {
						Object.assign(output, _defineProperty({}, key, source[key]));
					}
				});
			}
			return output;
		})
	};

	"use strict";

	var DEFAULTS = {};

	DEFAULTS.ngram = {
		letter: DEFAULTS.letter
	};

	DEFAULTS.syllable = {
		ngram: DEFAULTS.ngram
	};

	DEFAULTS.word = {
		ngram: DEFAULTS.ngram
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

	"use strict";

	/**
  * 
  * 
  * @param {any} string 
  */
	var Scheme = function () {
		function Scheme(string) {
			_classCallCheck(this, Scheme);

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


		_createClass(Scheme, null, [{
			key: 'expand',
			value: function expand(linesCount, keep) {
				if (keep) {
					var addition = this.scheme.length - linesCount;

					for (var i = 0; i < addition; i++) {
						var currentIndex = i;

						if (i + 1 > this.scheme.length) {
							currentIndex = i - this.scheme.length;
						}

						this.scheme.push(this.scheme[currentIndex]);
					}
				} else {}
			}

			/**
    * 
    * 
    * @param {any} linesCount 
    * @readonly
    */

		}, {
			key: 'shorten',
			value: function shorten(linesCount) {
				this.scheme.splice(linesCount);
			}
		}]);

		return Scheme;
	}();

	"use strict";

	var generate = {
		Line: function Line(options) {
			options = DEFAULTS.line.merge(arguments[0]);

			if (options.rhyme) {
				console.log("rhyme here");
			} else {
				console.log("no rhyme here");
			}
		},

		Lines: function Lines(options) {

			// options = DEFAULTS.lines.merge(arguments[0]);

			options = utils.mergeDeep(DEFAULTS.lines, options);

			var currentScheme;

			if (options.rhyme) {

				currentScheme = new Scheme(options.scheme.string);

				if (currentScheme.scheme.length < options.linesCount) {
					currentScheme.expand(options.linesCount, options.scheme.keep);
				} else if (currentScheme.scheme.length > options.linesCount) {
					currentScheme.shorten(options.linesCount);
				}
			}

			this.text = "";

			for (var i = 0; i < options.linesCount; i++) {

				var lineOptions = options.line;

				lineOptions.index = i;

				if (options.rhyme) {
					lineOptions.rhyme = currentScheme.scheme[i];
				}

				this[i] = new lapid.generate.Line(lineOptions);

				this.text += this[i].text + "\n";
			}
		}
	};

	"use strict";

	"use strict";

	var process = {};

	"use strict";

	(function () {
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

	var lapid$1 = function lapid$1() {
		this.LANGUAGE = "de";
		this.generate = generate;
		this.process = process;
	};

	return lapid$1;
});