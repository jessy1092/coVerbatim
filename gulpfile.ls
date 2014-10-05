require! <[gulp gulp-util express connect-livereload gulp-livereload path gulp-jade]>

app = express!
build_path = '_public'

gulp.task 'index', ->
    gulp.src './index.html'
        .pipe gulp.dest "#{build_path}"

gulp.task 'html', ->
    gulp.src './app/views/index.jade'
        .pipe gulp-jade!
        .pipe gulp.dest "#{build_path}"

gulp.task 'vendor', ->
    gulp.src './vendors/**/*'
        .pipe gulp.dest "#{build_path}/vendors"

gulp.task 'js' ->
    gulp.src './app/assets/scripts/*.js'
        .pipe gulp.dest "#{build_path}/assets/scripts/"

gulp.task 'css', ->
    gulp.src './app/assets/styles/*.css'
        .pipe gulp.dest "#{build_path}/assets/styles/"

gulp.task 'server', ->
    app.use connect-livereload!
    app.use express.static path.resolve "#{build_path}"
    app.listen 3000
    gulp-util.log 'listening on port 3000'

gulp.task 'watch', ->
    gulp-livereload.listen silent: true
    # gulp.watch './index.html', <[index]> .on \change, gulp-livereload.changed
    gulp.watch './app/views/*.jade', <[html]> .on \change, gulp-livereload.changed
    gulp.watch './app/assets/scripts/*.js', <[js]> .on \change, gulp-livereload.changed
    gulp.watch './app/assets/styles/*.css', <[css]> .on \change, gulp-livereload.changed

gulp.task 'build', <[html vendor js css]>
gulp.task 'dev', <[build server watch]>
gulp.task 'default', <[build]>
