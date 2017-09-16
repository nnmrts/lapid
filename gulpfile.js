const gulp = require("gulp");
require('gulp-release-it')(gulp);
const runSequence = require('run-sequence');

gulp.task("default", function() {
	runSequence(
		"bump-complete-release"
	);
});
