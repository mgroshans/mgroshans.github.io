var Q = require('q');
var del = require ('del');
var gulp = require('gulp');
var path = require('path');
var extend = require('extend');
var data = require('gulp-data');
var less = require('gulp-less');
var swig = require('gulp-swig');
var through = require('through2');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var markedSwig = require('swig-marked');

var posts = [];
var getPost = function () {
    var regex = /^(\d+)#(.*)/;
    return function (file) {
        var result = path.dirname(file.relative).match(regex);
        return {
            id: +result[1],
            slug: result[2]
        }
    };
}();

gulp.task('index', ['post-metadata'], function () {
    return gulp.src('./templates/index.html')
        .pipe(plumber())
        .pipe(data({ posts: posts }))
        .pipe(swig({
            setup: function (swig) {
                markedSwig.useTag(swig);
                markedSwig.useFilter(swig);
            }
        }))
        .pipe(gulp.dest('../'));
});

gulp.task('post-metadata', function () {
    return gulp.src('./posts/*/metadata.json')
        .pipe(plumber())
        .pipe(through.obj(function (file, encoding, callback) {
            var post = extend(getPost(file), JSON.parse(file.contents));
            posts[post.id] = post;
            this.push(file);
            return callback();
        }));
});

gulp.task('posts', ['post-metadata'], function () {
    return gulp.src('./posts/*/template.html')
        .pipe(plumber())
        .pipe(data(function (file) {
            return posts[getPost(file).id];
        }))
        .pipe(swig())
        .pipe(through.obj(function (file, encoding, callback) {
            // can't use gulp-rename because that only exposes the path
            file.path = path.join(file.base, file.data.slug + '.html');
            this.push(file);
            return callback();
        }))
        .pipe(gulp.dest('../posts'));
});

gulp.task('static', function () {
    return gulp.src('./static/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('../'))
});

gulp.task('styles', function() {
    return gulp.src('./less/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('fail.css'))
        .pipe(gulp.dest('../css/'));
});

gulp.task('default', ['static', 'styles', 'index', 'posts']);

gulp.task('clean', function (callback) {
    del('../!(_*)', {
            force: true
        }, callback);
});
