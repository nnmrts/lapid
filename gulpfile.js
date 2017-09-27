/* eslint-env node */

const gulp = require("gulp");

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

const pkg = require("./package.json");

const gls = require("gulp-live-server");
const replace = require("gulp-replace");
const header = require("gulp-header");
const minify = require("gulp-minify");
const del = require("del");
const moment = require("moment");
const GitHub = require("github-api");
const nodeCleanup = require("node-cleanup");
const chokidar = require("chokidar");
const jsdoc = require("gulp-jsdoc3");

const jsdocConfig = require("./.jsdoc.json");

const tasks = {
	build: {}
};

gulp.task("prebuild", () => {
	tasks.build.started = moment();

	return gulp.src("./src/**/*.js").pipe(gulp.dest("./.tmp/"));
});

gulp.task("remove-stricts:.tmp", ["prebuild"], () => (
	gulp.src("./.tmp/**/*.js", {
		base: "./.tmp/"

	})
		.pipe(replace(/"use strict";/, ""))
		.pipe(replace(/'use strict';/, ""))
		.pipe(gulp.dest("./.tmp/"))
));

gulp.task("rollup:browser", ["remove-stricts:.tmp"], () => (
	rollup({
		input: "./.tmp/main.js",
		name: pkg.name,
		format: "iife",
		plugins: [
			resolve(),
			commonjs(),
		]
	})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")))
));

gulp.task("rollup:main", ["remove-stricts:.tmp"], () => (
	rollup({
		input: "./.tmp/main.js",
		name: pkg.name,
		format: "cjs",
		plugins: []
	})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.main.replace("/lapid.js", "")))
));

gulp.task("rollup:module", ["remove-stricts:.tmp"], () => (
	rollup({
		input: "./.tmp/main.js",
		name: pkg.name,
		format: "es",
		plugins: []
	})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.module.replace("/lapid.js", "")))
));

gulp.task("babel", ["rollup:browser", "rollup:main", "rollup:module"], () => (
	gulp.src(pkg.browser)
		.pipe(babel())
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")))
));

gulp.task("minify", ["babel"], () => (
	gulp.src(pkg.browser)
		.pipe(minify({
			ext: {
				min: ".min.js"
			},
			noSource: true
		}))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")))
));

gulp.task("remove-stricts:dist", ["minify"], () => (gulp.src("./dist/**/*.js", {
	base: "./dist/"
})
	.pipe(replace(/"use strict";/, ""))
	.pipe(replace(/'use strict';/, ""))
	.pipe(gulp.dest("./dist/"))
));

gulp.task("add-stricts:dist", ["remove-stricts:dist"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(header("\n\"use strict\";"))
		.pipe(gulp.dest("./dist/"))
));

gulp.task("header", ["add-stricts:dist"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(header(fs.readFileSync(".header.js", "utf8"), {
			pkg
		}))
		.pipe(gulp.dest("./dist/"))
));

gulp.task("clean:.tmp", () => (
	del(".tmp")
));

gulp.task("finalize", ["header"], () => {
	gulp.start("clean:.tmp");

	return gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(gulp.dest("./dist/"));
});

gulp.task("build", ["finalize"], () => {
	tasks.build.finished = moment();

	tasks.build.took = tasks.build.finished.diff(tasks.build.started, "seconds", true);

	gutil.log(gutil.colors.green(`build took: ${tasks.build.took} seconds`));
});

gulp.task("backup:dist", ["remove-stricts:.tmp"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(gulp.dest("./dist-backup/"))
));

gulp.task("rollup:dev", ["backup:dist"], () => {
	let cache;

	rollup({
		input: "./.tmp/main.js",
		name: pkg.name,
		format: "iife",
		cache,
		plugins: [
			resolve(),
			commonjs(),
		]
	}).on("bundle", (bundle) => {
		cache = bundle;
	})
		.pipe(source("lapid.js"))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")));
});

gulp.task("babel:dev", ["rollup:dev"], () => (
	gulp.src(pkg.browser)
		.pipe(babel())
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")))
));

gulp.task("minify:dev", ["babel:dev"], () => (
	gulp.src(pkg.browser)
		.pipe(minify({
			ext: {
				src: "-debug.js",
				min: ".min.js"
			},
			noSource: true
		}))
		.pipe(gulp.dest(pkg.browser.replace("/lapid.js", "")))
));

gulp.task("remove-stricts:dev", ["minify:dev"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(replace(/"use strict";/, ""))
		.pipe(replace(/'use strict';/, ""))
		.pipe(gulp.dest("./dist/"))
));

gulp.task("add-stricts:dev", ["remove-stricts:dev"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(header("\n\"use strict\";"))
		.pipe(gulp.dest("./dist/"))
));

gulp.task("header:dev", ["add-stricts:dev"], () => (
	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(header(fs.readFileSync(".header.js", "utf8"), {
			pkg
		}))
		.pipe(gulp.dest("./dist/"))
));

gulp.task("finalize:dev", ["header:dev"], () => (
	// gulp.start("clean:.tmp");

	gulp.src("./dist/**/*.js", {
		base: "./dist/"
	})
		.pipe(gulp.dest("./dist/"))
));

gulp.task("build:dev", ["finalize:dev"], () => {
	tasks.build.finished = moment();

	tasks.build.took = tasks.build.finished.diff(tasks.build.started, "seconds", true);

	gutil.log(gutil.colors.green(`build took: ${tasks.build.took} seconds`));
});

const server = gls.static("./", 8000);

gulp.task("start-server", ["build:dev"], () => {
	server.start();
});

gulp.task("watch:src", ["start-server"], () => (
	chokidar.watch("src/**/*.js", {
		ignoreInitial: true
	})
		.on("all", () => {
			gulp.start("build:dev");
		})
));

gulp.task("watch:dist", ["start-server"], () => (
	chokidar.watch("dist/**/*.js", {
		ignoreInitial: true
	})
		.on("all", (watchPath) => {
			const type = "changed";
			server.notify.apply(server, [{
				type,
				path: watchPath
			}]);
		})
		.on("error", (error) => {
			gutil.log(error);
		})
));

gulp.task("watch:examples", ["start-server"], () => (chokidar.watch("examples/**/*")
	.on("all", (watchPath) => {
		const type = "changed";
		server.notify.apply(server, [{
			type,
			path: watchPath
		}]);
	})
	.on("error", (error) => {
		gutil.log(error);
	})
));

gulp.task("dev", ["watch:src", "watch:dist", "watch:examples"], () => {

});

// --------------------------------------------------------------
// --------------------------------------------------------------
// --------------------------------------------------------------

const branch = yargs.argv.branch || "master";

const rootDir = `${path.resolve(yargs.argv.rootDir || "./")}/`;

const currVersion = () => JSON.parse(fs.readFileSync(`${rootDir}package.json`)).version;

const preid = () => {
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

const versioning = () => {
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

gulp.task("commit:build", ["build"], () => (
	gulp.src("./dist/**/*.js", {
		cwd: rootDir
	}).pipe(git.commit("Build: generated dist files", {
		cwd: rootDir
	}))
));

gulp.task("docs", ["commit:build"], () => {
	gulp.src(["README.md", "./src/**/*.js"], {
		read: false
	})
		.pipe(jsdoc(jsdocConfig));
});

gulp.task("commit:docs", ["docs"], () => (
	gulp.src("./docs/**", {
		cwd: rootDir
	}).pipe(git.commit("Build: generated docs files", {
		cwd: rootDir
	}))
));

gulp.task("bump", ["commit:docs"], (cb) => {
	const newVersion = semver.inc(currVersion(), versioning(), preid());

	git.pull("origin", branch, {
		args: "--rebase",
		cwd: rootDir
	});

	const paths = {
		versionsToBump: _.map(["package.json", "bower.json", "manifest.json"], fileName => rootDir + fileName)
	};

	gulp.src(paths.versionsToBump, {
		cwd: rootDir
	})
		.pipe(jeditor({
			version: newVersion
		}))
		.pipe(gulp.dest("./", {
			cwd: rootDir
		}));

	const commitMessage = `Build: Bumps version to v${newVersion}`;

	gulp.src("./*.json", {
		cwd: rootDir
	}).pipe(git.commit(commitMessage, {
		cwd: rootDir
	})).on("end", () => {
		git.push(
			"origin", branch, {

				cwd: rootDir
			}, (err) => {
				if (err) {
					gutil.log(err);
				}
				else {
					cb();
				}
			}
		);
	});
});

let tag;

const tagVersion = function(newOptions) {
	let opts = newOptions;

	if (!newOptions) {
		opts = {};
	}

	if (!opts.key) {
		opts.key = "version";
	}

	if (typeof opts.prefix === "undefined") {
		opts.prefix = "v";
	}
	if (typeof opts.push === "undefined") {
		opts.push = true;
	}

	/**
	 *
	 *
	 * @param {any} file
	 * @param {any} cb
	 */
	function modifyContents(file, cb) {
		let version = opts.version;
		if (!opts.version) {
			if (file.isNull()) {
				cb(null, file);
			}
			if (file.isStream()) {
				cb(new Error("gulp-tag-version: streams not supported"));
			}

			const json = JSON.parse(file.contents.toString());
			version = json[opts.key];
		}
		tag = opts.prefix + version;

		const message = tag;

		gutil.log(`Tagging as: ${gutil.colors.cyan(tag)}`);
		git.tag(
			tag, message, {
				args: "-s",
				cwd: opts.cwd
			}, (err) => {
				if (err) {
					throw err;
				}
			}
		);

		git.tag(tag, {
			args: "-v",
			cwd: opts.cwd
		}, (err) => {
			if (err) {
				throw err;
			}
			cb();
		});
	}

	return map(modifyContents);
};

gulp.task("tag-and-push", ["bump"], (done) => {
	gulp.src("./", {
		cwd: rootDir
	})
		.pipe(tagVersion({
			version: currVersion(),
			cwd: rootDir
		}))
		.on("end", () => {
			git.push(
				"origin", branch, {
					args: "--tags",
					cwd: rootDir
				}, done
			);
		});
});

gulp.task("npm-publish", ["tag-and-push"], (done) => {
	childProcess.spawn("npm", ["publish", rootDir], {
		stdio: "inherit",
		shell: true
	}).on("close", done);
});

gulp.task("release", ["npm-publish"], (cb) => {
	const GitHubAuth = JSON.parse(fs.readFileSync(`${rootDir}.githubauth`));

	const gh = new GitHub(GitHubAuth);

	const repo = gh.getRepo("nnmrts", "lapid");

	repo.listTags().then(() => {
		const tagName = `v${currVersion()}`;

		const targetCommitish = branch;

		const name = tagName;

		const body = "browser: [lapid.js](https://raw.githubusercontent.com/nnmrts/lapid/%t/dist/browser/lapid.js)\nnpm: [lapid.js](https://raw.githubusercontent.com/nnmrts/lapid/%t/dist/lapid.js)\nes module: [lapid.js](https://raw.githubusercontent.com/nnmrts/lapid/%t/dist/module/lapid.js)".replace(/%t/g, tagName);

		const prerelease = versioning() === "prerelease";

		return repo.createRelease({
			tag_name: tagName,
			target_commitish: targetCommitish,
			name,
			body,
			draft: false,
			prerelease
		}).then(() => {}).catch((e) => {
			gutil.log(e);

			cb(e);
		});
	}).catch((e) => {
		cb(e);
	});
});

gulp.task("default", ["release"]);

gulp.task("clean:dist", () => (
	del("dist")
));

gulp.task("restore:dist", ["clean:dist"], () => (
	gulp.src("./dist-backup/**/*.js", {
		base: "./dist-backup/"
	})
		.pipe(gulp.dest("./dist/"))
));

gulp.task("clean:dist-backup", ["restore:dist"], () => (
	del("dist-backup")
));

let cleanSignal;

gulp.task("kill-process", ["clean:dist-backup"], () => (
	process.kill(process.pid, cleanSignal)
));

nodeCleanup((exitCode, signal) => {
	if (signal) {
		cleanSignal = signal;

		server.stop();

		gulp.start("kill-process");

		nodeCleanup.uninstall(); // don't call cleanup handler again
		return false;
	}
	return undefined;
}, {
	ctrl_C: "{^C}",
	uncaughtException: "Uh oh. Look what happened:"
});
