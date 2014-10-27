require! <[gulp gulp-util gulp-livereload gulp-jade]>
require! <[browserify vinyl-source-stream express connect-livereload path]>

source     = vinyl-source-stream
app        = express!
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
  gulp.src './app/scripts/*.js'
    .pipe gulp.dest "#{build_path}/scripts/"

gulp.task 'css', ->
  gulp.src './app/styles/*.css'
    .pipe gulp.dest "#{build_path}/styles/"

gulp.task 'browserify', ->
  browserify './app/scripts/app.js'
    .bundle!
    .pipe source 'bundle.js'
    .pipe gulp.dest "#{build_path}/scripts/"

gulp.task 'server', ->
  app.use connect-livereload!
  app.use express.static path.resolve "#{build_path}"
  app.listen 3000
  gulp-util.log 'listening on port 3000'

gulp.task 'watch', ->
  gulp-livereload.listen silent: true
  # gulp.watch './index.html', <[index]> .on \change, gulp-livereload.changed
  gulp.watch './app/views/*.jade', <[html]> .on \change, gulp-livereload.changed
  gulp.watch './app/scripts/*.js', <[browserify]> .on \change, gulp-livereload.changed
  gulp.watch './app/styles/*.css', <[css]> .on \change, gulp-livereload.changed

gulp.task 'build', <[html browserify vendor css]>
gulp.task 'dev', <[build server watch]>
gulp.task 'default', <[build]>
