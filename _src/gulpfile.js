var gulp = require('gulp');
var path = require('path');
var through = require('through2');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var Handlebars = require('handlebars');

gulp.task('partials', function () {
    return gulp.src('./partials/**/*.hbs')
        .pipe(through.obj(function (file, encoding, callback) {
            Handlebars.registerPartial(path.basename(file.path, '.hbs'), file.contents.toString());
            return callback();
        }));
});

gulp.task('templates', ['partials'], function () {
    return gulp.src('./templates/**/*.hbs')
        .pipe(through.obj(function (file, encoding, callback) {
            file.contents = new Buffer(Handlebars.compile(file.contents.toString())());
            this.push(file);
            return callback();
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulp.dest('../'));
});

gulp.task('default', ['templates']);
