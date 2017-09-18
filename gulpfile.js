"use strict";

const gulp = require("gulp");
const runSequence = require("run-sequence");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

require("gulp-release-it")(gulp);

gulp.task("rollup:browser", function() {
	return rollup({
			input: "src/main.js",
			name: pkg.name,
			format: "umd",
			plugins: [
				resolve(), // so Rollup can find `ms`
				commonjs() // so Rollup can convert `ms` to an ES module
			]

		})
		// give the file the name you want to output with
		.pipe(source("lapid.js"))

		// and output to ./dist/app.js as normal.
		.pipe(gulp.dest(pkg.browser));
});

gulp.task("rollup:main", function() {
	return rollup({
			input: "src/main.js",
			name: pkg.name,
			format: "cjs"
		})
		// give the file the name you want to output with
		.pipe(source("lapid.js"))

		// and output to ./dist/app.js as normal.
		.pipe(gulp.dest(pkg.main));
});

gulp.task("rollup:module", function() {
	return rollup({
			input: "src/main.js",
			name: pkg.name,
			format: "es",
		})
		// give the file the name you want to output with
		.pipe(source("lapid.js"))

		// and output to ./dist/app.js as normal.
		.pipe(gulp.dest(pkg.module));
});

gulp.task("default", function() {
	runSequence(
		"rollup:browser",
		"rollup:main",
		"rollup:module",
		"bump-complete-release"
	);
});
