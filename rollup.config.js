"use strict";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default [
	// browser-friendly UMD build
	{
		input: "src/main.js",
		name: pkg.name,
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		],
		targets: [{
				dest: pkg.browser,
				format: "umd",
			}, {
				dest: pkg.main,
				format: "cjs"
			},
			{
				dest: pkg.module,
				format: "es"
			}
		]

	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// the `targets` option which can specify `dest` and `format`)

	// {
	// 	entry: 'src/main.js',
	// 	external: ['ms'],
	// 	targets: [
	// 		{ dest: pkg.main, format: 'cjs' },
	// 		{ dest: pkg.module, format: 'es' }
	// 	]
	// }
];
