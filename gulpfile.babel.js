"use strict";

import gulp from "gulp";
import runSequence from "run-sequence";

import rollup from "rollup-stream";
import source from "vinyl-source-stream";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import fs from "fs";
import argv from "yargs";
import path from "path";
import semver from "semver";
import git from "gulp-git";
import _ from "lodash";
import jeditor from "gulp-json-editor";
import gutil from "gulp-util";
import map from "map-stream";
import spawn from "child_process";
import babel from "gulp-babel";

import pkg from "./package.json";

gulp.task("rollup:browser", function() {
	return rollup({
			input: "src/main.js",
			name: pkg.name,
			format: "umd",
			plugins: [
				resolve(),
				commonjs()
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
			format: "cjs",
			plugins: []
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
			plugins: []
		})
		// give the file the name you want to output with
		.pipe(source("lapid.js"))

		// and output to ./dist/app.js as normal.
		.pipe(gulp.dest(pkg.module.replace("/lapid.js", "")));
});

gulp.task("babel", function() {
	gulp.src(pkg.browser)
		.pipe(babel())
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

// ----------------------------

let branch = argv.argv.branch || "master";

let rootDir = path.resolve(argv.argv.rootDir || "./") + "/";

var currVersion = function() {
	return JSON.parse(fs.readFileSync(rootDir + "package.json")).version;
};

var preid = function() {
	if (argv.alpha) {
		return "alpha";
	}
	if (argv.beta) {
		return "beta";
	}
	if (argv.RC) {
		return "RC";
	}
	if (argv["pre-release"]) {
		return argv["pre-release"];
	}
	return undefined;
};

var versioning = function() {
	if (preid()) {
		return "prerelease";
	}
	if (argv.minor) {
		return "minor";
	}
	if (argv.major) {
		return "major";
	}
	return "patch";
};

var tagVersion = function(opts) {
	if (!opts) opts = {};
	if (!opts.key) opts.key = "version";
	if (typeof opts.prefix === "undefined") opts.prefix = "v";
	if (typeof opts.push === "undefined") opts.push = true;
	if (typeof opts.label === "undefined") opts.label = "Tagging as %t";

	function modifyContents(file, cb) {
		var version = opts.version; // OK if undefined at this time
		if (!opts.version) {
			if (file.isNull()) return cb(null, file);
			if (file.isStream()) return cb(new Error("gulp-tag-version: streams not supported"));

			var json = JSON.parse(file.contents.toString());
			version = json[opts.key]
		}
		var tag = opts.prefix + version;
		var label = opts.label.replace("%t", tag);
		gutil.log("Tagging as: " + gutil.colors.cyan(tag));
		git.tag(tag, label, {
			cwd: opts.cwd
		}, function(err) {
			if (err) {
				throw err;
			}
			cb();
		});
	}

	return map(modifyContents)
};

gulp.task("bump", function(resolve) {
	let newVersion = semver.inc(currVersion(), versioning(), preid());

	git.pull("origin", branch, {
		args: "--rebase",
		cwd: rootDir
	});

	let paths = {
		versionsToBump: _.map(["package.json", "bower.json", "manifest.json"], function(fileName) {
			return rootDir + fileName;
		})
	};

	gulp.src(paths.versionsToBump, {
			cwd: rootDir
		})
		.pipe(jeditor({
			"version": newVersion
		}))
		.pipe(gulp.dest("./", {
			cwd: rootDir
		}));

	let commitMessage = "Bumps version to v" + newVersion;

	gulp.src("./*.json", {
		cwd: rootDir
	}).pipe(git.commit(commitMessage, {
		cwd: rootDir
	})).on("end", function() {
		git.push("origin", branch, {

			cwd: rootDir
		}, function(err) {
			if (err) {
				console.error(err);
			}
			else {
				resolve();
			}
		});
	});

});

gulp.task("tag-and-push", function(done) {
	gulp.src("./", {
			cwd: rootDir
		})
		.pipe(tagVersion({
			version: currVersion(),
			cwd: rootDir
		}))

		.on("end", function() {
			git.push("origin", branch, {
				args: "--tags",
				cwd: rootDir
			}, done);
		});
});

gulp.task("npm-publish", function(done) {
	spawn.spawn("npm", ["publish", rootDir], {
		stdio: "inherit",
		shell: true
	}).on("close", done);
});

gulp.task("bump-complete-release", function(cb) {
	runSequence("bump", "tag-and-push", "npm-publish", cb);
});

gulp.task("default", function() {
	runSequence(
		"rollup:browser",
		"babel",
		"rollup:main",
		"rollup:module",
		"bump-complete-release"
	);
});
