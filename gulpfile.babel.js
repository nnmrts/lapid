"use strict";

import gulp from "gulp";
import runSequence from "run-sequence";
import rollup from "rollup-stream";
import source from "vinyl-source-stream";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

import overwrite from "overwrite";

const gulpRelease = overwrite("gulp-release-it", {
	"main.js": contents => {
		return contents
			.replace(/\{stdio: 'inherit'\}/, "{stdio: 'inherit', shell: 'true'}")
			.replace(/require\('run\-sequence'\)/, "require('run-sequence').use(gulp)");
	}
});

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
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
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
		.pipe(gulp.dest(pkg.main.replace("/lapid.js", "")));
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
		.pipe(gulp.dest(pkg.module.replace("/lapid.js", "")));
});

gulp.task("default", function() {
	runSequence(
		"rollup:browser",
		"rollup:main",
		"rollup:module",
		"bump-complete-release"
	);
});
