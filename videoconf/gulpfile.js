/// <binding AfterBuild='copy_js' />
const gulp = require('gulp');
const del = require('del');
var browserify = require('gulp-browserify');

var paths = {
    scripts: ["scripts/**/*.ts", "scripts/**/*.ts", "scripts/**/*.map"],
};


gulp.task("clean", async function () {
    return del(["wwwroot/scripts/**/*"]);
});

gulp.task("copy_ts", async function () {
    gulp.src(paths.scripts).pipe(gulp.dest("wwwroot/scripts"));
});

gulp.task('copy_js', async function () {
    gulp.src('scripts/build/user.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));
    gulp.src('scripts/build/vector_icon.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));
    gulp.src('scripts/build/meeting_list.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));

    gulp.src('scripts/build/meeting_ui.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));

    gulp.src('scripts/build/lobby.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));

    gulp.src('scripts/build/meeting.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('wwwroot/scripts'));
});

/*gulp.task('watch', function () {
    gulp.watch('scripts/*.ts', gulp.series('clean', 'copy_ts_map_for_debugging', 'complie_copy_js'));
});*/



