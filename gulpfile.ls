require! <[gulp gulp-util express connect-livereload gulp-livereload path]>

app = express!
build_path = '_public'

gulp.task 'index', ->
    gulp.src './index.html'
        .pipe gulp.dest "#{build_path}"

gulp.task 'vendor', ->
    gulp.src './vendors/**/*'
        .pipe gulp.dest "#{build_path}/vendors"

gulp.task 'js' ->
    gulp.src './assets/scripts/*.js'
        .pipe gulp.dest "#{build_path}/assets/scripts/"

gulp.task 'css', ->
    gulp.src './assets/styles/*.css'
        .pipe gulp.dest "#{build_path}/assets/styles/"

gulp.task 'server', ->
    app.use connect-livereload!
    app.use express.static path.resolve "#{build_path}"
    app.listen 3000
    gulp-util.log 'listening on port 3000'

gulp.task 'watch', ->
    gulp-livereload.listen silent: true
    gulp.watch './index.html', <[index]> .on \change, gulp-livereload.changed
    gulp.watch './assets/scripts/*.js', <[js]> .on \change, gulp-livereload.changed
    gulp.watch './assets/styles/*.css', <[css]> .on \change, gulp-livereload.changed

gulp.task 'build', <[index vendor js css]>
gulp.task 'dev', <[build server watch]>
gulp.task 'default', <[build]>
