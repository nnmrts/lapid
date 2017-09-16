const gulp = require("gulp");
require('gulp-release-it')(gulp);

gulp.task("default", function() {
	runSequence(
		"complete-release",
		function(error) {
			if (error) {
				console.log(error.message);
			}
			else {
				console.log('RELEASE FINISHED SUCCESSFULLY');
			}
			callback(error);
		});
});
