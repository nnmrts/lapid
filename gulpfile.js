"use strict";

const gulp = require("gulp");
const runSequence = require("run-sequence");

const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");

const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

const fs = require("fs");
const yargs = require("yargs");
const path = require("path");
const semver = require("semver");
const git = require("gulp-git");
const _ = require("lodash");
const jeditor = require("gulp-json-editor");
const gutil = require("gulp-util");
const map = require("map-stream");
const childProcess = require("child_process");
const babel = require("gulp-babel");
const rollupBabel = require("rollup-plugin-babel");

const pkg = require("./package.json");

const gls = require("gulp-live-server");
const replace = require("gulp-replace");
const header = require("gulp-header");
const minify = require("gulp-minify");
const del = require("del");
const removeUseStrict = require("gulp-remove-use-strict");
const moment = require("moment");
const GitHub = require("github-api");
const nodeCleanup = require("node-cleanup");
const chokidar = require('chokidar');

var tasks = {
	build: {}
};

gulp.task("prebuild", function() {
	tasks.build.started = moment();

	return gulp.src("./src/**/*.js")
		.pipe(gulp.dest("./.tmp/"));
});

gulp.task("remove-stricts:.tmp", ["prebuild"], function() {
	return gulp.src("./.tmp/**/*.js", {
			base: "./.tmp/"

		})
		.pipe(replace(/"use strict";/, ""))
		.pipe(replace(/'use strict';/, ""))
		.pipe(gulp.dest("./.tmp/"));
});

gulp.task("rollup:browser", ["remove-stricts:.tmp"], function() {

	return rollup({
			input: "./.tmp/main.js",
			name: pkg.name,
			format: "iife",
			plugins: [
				resolve(),
				commonjs(),
			]
		})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("rollup:main", ["remove-stricts:.tmp"], function() {

	return rollup({
			input: "./.tmp/main.js",
			name: pkg.name,
			format: "cjs",
			plugins: []
		})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.main.replace("/lapid.js", "")));
});

gulp.task("rollup:module", ["remove-stricts:.tmp"], function() {

	return rollup({
			input: "./.tmp/main.js",
			name: pkg.name,
			format: "es",
			plugins: []
		})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.module.replace("/lapid.js", "")));
});

gulp.task("babel", ["rollup:browser", "rollup:main", "rollup:module"], function() {
	return gulp.src(pkg.browser)
		.pipe(babel())
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("minify", ["babel"], function() {
	return gulp.src(pkg.browser)
		.pipe(minify({
			ext: {
				min: ".min.js"
			},
			noSource: true
		}))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("remove-stricts:dist", ["minify"], function() {
	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(replace(/"use strict";/, ""))
		.pipe(replace(/'use strict';/, ""))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("add-stricts:dist", ["remove-stricts:dist"], function() {
	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(header("\n\"use strict\";"))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("header", ["add-stricts:dist"], function() {
	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(header(fs.readFileSync(".header.js", "utf8"), {
			pkg
		}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("clean:.tmp", function() {
	return del(".tmp");
});

gulp.task("finalize", ["header"], function() {

	gulp.start("clean:.tmp");

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(gulp.dest("./dist/"));
});

gulp.task("build", ["finalize"], function() {
	tasks.build.finished = moment();

	tasks.build.took = tasks.build.finished.diff(tasks.build.started, "seconds", true);

	gutil.log(gutil.colors.green("build took: " + tasks.build.took + " seconds"));
});

gulp.task("backup:dist", ["remove-stricts:.tmp"], function() {

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(gulp.dest("./dist-backup/"));
});

gulp.task("rollup:dev", ["backup:dist"], function() {

	return rollup({
			input: "./.tmp/main.js",
			name: pkg.name,
			format: "iife",
			plugins: [
				resolve(),
				commonjs(),
			]
		})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("babel:dev", ["rollup:dev"], function() {

	return gulp.src(pkg.browser)
		.pipe(babel())
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("minify:dev", ["babel:dev"], function() {

	return gulp.src(pkg.browser)
		.pipe(minify({
			ext: {
				src: "-debug.js",
				min: ".min.js"
			},
			noSource: true
		}))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("remove-stricts:dev", ["minify:dev"], function() {

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(replace(/"use strict";/, ""))
		.pipe(replace(/'use strict';/, ""))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("add-stricts:dev", ["remove-stricts:dev"], function() {

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(header("\n\"use strict\";"))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("header:dev", ["add-stricts:dev"], function() {

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(header(fs.readFileSync(".header.js", "utf8"), {
			pkg
		}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("finalize:dev", ["header:dev"], function() {

	gulp.start("clean:.tmp");

	return gulp.src("./dist/**/*.js", {
			base: "./dist/"
		})
		.pipe(gulp.dest("./dist/"));
});

gulp.task("build:dev", ["finalize:dev"], function() {
	tasks.build.finished = moment();

	tasks.build.took = tasks.build.finished.diff(tasks.build.started, "seconds", true);

	gutil.log(gutil.colors.green("build took: " + tasks.build.took + " seconds"));
});

var server = gls.static("./", 8000);

gulp.task("start-server", ["build:dev"], function() {
	server.start();
});

gulp.task("watch:src", ["start-server"], function() {
	var type = "";

	return chokidar.watch("dist/**/*.js")
		.on("add", function(path, stats) {
			type = "added";
		})
		.on("change", function(path, stats) {
			type = "changed";

		}).on("unlink", function(path, stats) {
			type = "deleted";

		}).on("ready", function(path, stats) {
			gulp.start("build:dev");

		});

});

gulp.task("watch:dist", ["start-server"], function() {
	var type = "";

	return chokidar.watch("dist/**/*.js")
		.on("add", function(path, stats) {
			type = "added";
		})
		.on("change", function(path, stats) {
			type = "changed";

		}).on("unlink", function(path, stats) {
			type = "deleted";

		}).on("ready", function(path, stats) {
			server.notify.apply(server, [{
				type,
				path
			}]);
		});

});

gulp.task("watch:examples", ["start-server"], function() {
	var type = "";

	return chokidar.watch("examples/**/*")
		.on("add", function(path, stats) {
			type = "added";
		})
		.on("change", function(path, stats) {
			type = "changed";

		}).on("unlink", function(path, stats) {
			type = "deleted";

		}).on("ready", function(path, stats) {
			server.notify.apply(server, [{
				type,
				path
			}]);
		});

});

gulp.task("dev", ["watch:src", "watch:dist", "watch:examples"], function() {

});

// --------------------------------------------------------------
// --------------------------------------------------------------
// --------------------------------------------------------------

let branch = yargs.argv.branch || "master";

let rootDir = path.resolve(yargs.argv.rootDir || "./") + "/";

let currVersion = function() {
	return JSON.parse(fs.readFileSync(rootDir + "package.json")).version;
};

let preid = function() {
	if (yargs.argv.alpha) {
		return "alpha";
	}
	if (yargs.argv.beta) {
		return "beta";
	}
	if (yargs.argv.RC) {
		return "RC";
	}
	if (yargs.argv["pre-release"]) {
		return yargs.argv["pre-release"];
	}
	return undefined;
};

let versioning = function() {
	if (preid()) {
		return "prerelease";
	}
	if (yargs.argv.minor) {
		return "minor";
	}
	if (yargs.argv.major) {
		return "major";
	}
	return "patch";
};

gulp.task("commit:build", ["build"], function() {

	return gulp.src("./dist/**/*.js", {
		cwd: rootDir
	}).pipe(git.commit("Build: generated dist files", {
		cwd: rootDir
	}));
});

gulp.task("bump", ["commit:build"], function(resolve) {
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

	let commitMessage = "Build: Bumps version to v" + newVersion;

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

var tag;

var tagVersion = function(opts) {
	if (!opts) opts = {};
	if (!opts.key) opts.key = "version";
	if (typeof opts.prefix === "undefined") opts.prefix = "v";
	if (typeof opts.push === "undefined") opts.push = true;

	function modifyContents(file, cb) {
		var version = opts.version;
		if (!opts.version) {
			if (file.isNull()) return cb(null, file);
			if (file.isStream()) return cb(new Error("gulp-tag-version: streams not supported"));

			var json = JSON.parse(file.contents.toString());
			version = json[opts.key];
		}
		tag = opts.prefix + version;

		var message = tag;

		gutil.log("Tagging as: " + gutil.colors.cyan(tag));
		git.tag(tag, message, {
			cwd: opts.cwd
		}, function(err) {
			if (err) {
				throw err;
			}
			cb();
		});
	}

	return map(modifyContents);
};

gulp.task("tag-and-push", ["bump"], function(done) {

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

gulp.task("npm-publish", ["tag-and-push"], function(done) {
	childProcess.spawn("npm", ["publish", rootDir], {
		stdio: "inherit",
		shell: true
	}).on("close", done);
});

gulp.task("release", ["npm-publish"], function(cb) {
	var GitHubAuth = JSON.parse(fs.readFileSync(rootDir + ".githubauth"));

	var gh = new GitHub(GitHubAuth);

	var repo = gh.getRepo("nnmrts", "lapid");

	repo.listTags().then(function(response) {
		let tag_name = "v" + currVersion();

		let target_commitish = branch;

		let name = tag_name;

		let body = "browser: [lapid.js](../../blob/%t/dist/browser/lapid.js)\nnpm: [lapid.js](../../blob/%t/dist/lapid.js)\nes module: [lapid.js](../../blob/%t/dist/module/lapid.js)".replace(/%t/g, tag_name);

		let prerelease = versioning() === "prerelease";

		return repo.createRelease({
			tag_name,
			target_commitish,
			name,
			body,
			draft: false,
			prerelease
		}).then(function(response) {}).catch(function(e) {
			gutil.log(e);

			cb(e);
		});

	}).catch(function(e) {
		cb(e);
	});

});

gulp.task("default", ["release"]);

gulp.task("clean:dist", function() {
	return del("dist");
});

gulp.task("restore:dist", ["clean:dist"], function() {
	return gulp.src("./dist-backup/**/*.js", {
			base: "./dist-backup/"
		})
		.pipe(gulp.dest("./dist/"));
});

gulp.task("clean:dist-backup", ["restore:dist"], function() {
	return del("dist-backup");
});

var cleanSignal;

gulp.task("kill-process", ["clean:dist-backup"], function() {
	return process.kill(process.pid, cleanSignal);
});

nodeCleanup(function(exitCode, signal) {

	if (signal) {

		cleanSignal = signal;

		server.stop();

		gulp.start("kill-process");

		nodeCleanup.uninstall(); // don't call cleanup handler again 
		return false;
	}

}, {
	ctrl_C: "{^C}",
	uncaughtException: "Uh oh. Look what happened:"
});
