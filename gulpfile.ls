require! <[gulp gulp-util express connect-livereload gulp-livereload path]>

app = express!

gulp.task 'html' ->
    gulp.src './views/*.html'

gulp.task 'index' ->
    gulp.src './index.html'

gulp.task 'js' ->
    gulp.src './assets/scripts/*.js'

gulp.task 'img' ->
    gulp.src './assets/imgs/*'

gulp.task 'css' ->
    gulp.src './assets/styles/*.css'

gulp.task 'data' ->
    gulp.src './assets/data/*'

gulp.task 'server', ->
    app.use connect-livereload!
    app.use express.static path.resolve '.'
    app.listen 3000
    gulp-util.log 'listening on port 3000'

gulp.task 'watch', ->
    gulp-livereload.listen silent: true
    gulp.watch './view/*.html', <[html]> .on \change, gulp-livereload.changed
    gulp.watch './index.html', <[index]> .on \change, gulp-livereload.changed
    gulp.watch './assets/scripts/*.js', <[js]> .on \change, gulp-livereload.changed
    gulp.watch './assets/imgs/*', <[img]> .on \change, gulp-livereload.changed
    gulp.watch './assets/styles/*.css', <[css]> .on \change, gulp-livereload.changed
    gulp.watch './assets/data/*', <[data]> .on \change, gulp-livereload.changed

gulp.task 'dev', <[server watch]>
gulp.task 'default', <[build]>
