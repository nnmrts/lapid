"use strict";

import gulp from "gulp";
import runSequence from "run-sequence";

import rollup from "rollup-stream";
import source from "vinyl-source-stream";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import fs from "fs";
import argv from "yargs";
import rootDir from "path";
import semver from "semver";
import git from "gulp-git";
import _ from "lodash";
import jeditor from "gulp-json-editor";
import gutil from "gulp-util";
import map from "map-stream";
import spawn from "child_process";
import babel from "gulp-babel";

import pkg from "./package.json";

// import overwrite from "overwrite";

// const gulpRelease = overwrite("gulp-release-it", {
// 	"main.js": contents => {
// 		return contents
// 			.replace(/\{stdio: 'inherit'\}/, "{stdio: 'inherit', shell: 'true'}")
// 			.replace(/require\('run\-sequence'\)/, "require('run-sequence').use(gulp)");
// 	}
// });

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
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("bump-complete-release", function(done) {
	let currentRootDir = rootDir.resolve(argv.argv.rootDir || "./") + "/";

	let currVersion = JSON.parse(
		fs.readFileSync(
			currentRootDir + "package.json"
		)
	).version;

	var preid = void 0;

	if (argv.argv.alpha) {
		preid = "alpha";
	}
	if (argv.argv.beta) {
		preid = "beta";
	}
	if (argv.argv.RC) {
		preid = "RC";
	}
	if (argv.argv["pre-release"]) {
		preid = argv.argv["pre-release"];
	}

	var versioning = "patch";

	if (preid) {
		versioning = "prerelease";
	}
	if (argv.argv.minor) {
		versioning = "minor";
	}
	if (argv.argv.major) {
		versioning = "major";
	}

	let newVersion = semver.inc(currVersion, versioning, preid);

	let branch = argv.argv.branch || "master";

	git.pull("origin", branch, {
		args: "--rebase",
		cwd: currentRootDir
	});

		let paths = {
			versionsToBump: _.map(["package.json", "bower.json", "manifest.json"], function(fileName) {
				return currentRootDir + fileName;
			})
		};

		gulp.src(paths.versionsToBump, {
				cwd: currentRootDir
			})
			.pipe(jeditor({
				"version": newVersion
			}))
			.pipe(gulp.dest("./", {
				cwd: currentRootDir
			}));

		let commitMessage = "Bumps version to v" + newVersion;

		gulp.src("./*.json", {
			cwd: currentRootDir
		}).pipe(git.commit(commitMessage, {
			cwd: currentRootDir
		})).on('end', function() {
			git.push("origin", branch, {

				cwd: currentRootDir
			}, function(err) {
				if (err) {
					console.error(err);
				}
				else {
					// resolve();
				}
			});
		});

		let tagVersion = function() {
			function modifyContents(file, cb) {
				var version = currVersion; // OK if undefined at this time
				if (!currVersion) {
					if (file.isNull()) return cb(null, file);
					if (file.isStream()) return cb(new Error("gulp-tag-version: streams not supported"));

					var json = JSON.parse(file.contents.toString());
					version = json.version;
				}
				var tag = "v" + version;
				var label = "Tagging as %t".replace("%t", tag);
				gutil.log("Tagging as: " + gutil.colors.cyan(tag));
				git.tag(tag, label, {
					cwd: currentRootDir
				}, function(err) {
					if (err) {
						throw err;
					}
					cb();
				});
			}

			return map(modifyContents);
		};

		gulp.src("./", {
				cwd: currentRootDir
			})
			.pipe(tagVersion())
			.on('end', function() {
				git.push('origin', branch, {
					args: '--tags',
					cwd: currentRootDir
				});
			});

		spawn.spawn("npm", ["publish", currentRootDir], {
			stdio: "inherit",
			shell: true
		}).on("close", done);




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
