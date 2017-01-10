const del = require ('del');
const gulp = require('gulp');
const path = require('path');
const extend = require('extend');
const marked = require('marked');
const data = require('gulp-data');
const less = require('gulp-less');
const through = require('through2');
const nunjucks = require('nunjucks');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const gnunjucks = require('gulp-nunjucks');
const markdown = require('nunjucks-markdown');
const frontMatter = require('gulp-front-matter');

const posts = [];
const nunjucksEnv = nunjucks.configure('./templates');
markdown.register(nunjucksEnv, marked);

gulp.task('index', ['posts'], function () {
    return gulp.src('./templates/index.html')
        .pipe(plumber())
        .pipe(gnunjucks.compile({ posts: posts }, {env: nunjucksEnv}))
        .pipe(gulp.dest('../'));
});

gulp.task('posts', function () {
    const regex = /^(\d+)#(.*)/;
    return gulp.src('./posts/*/post.html')
        .pipe(plumber())
        .pipe(frontMatter({ property: 'data', remove: true }))
        .pipe(through.obj(function (file, encoding, callback) {
            var match = path.dirname(file.relative).match(regex);
            file.data = extend(file.data, {
                id: +match[1],
                slug: match[2]
            });
            posts[file.data.id] = file.data;
            this.push(file);
            return callback();
        }))
        .pipe(gnunjucks.compile({}, {env: nunjucksEnv}))
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

gulp.task('styles', function () {
    return gulp.src('./less/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('site.css'))
        .pipe(gulp.dest('../css/'));
});

gulp.task('default', ['static', 'styles', 'index', 'posts']);

gulp.task('clean', function (callback) {
    del('../!(_*)', {
            force: true
        }, callback);
});
