'use strict';
var gulp = require('gulp');
var merge2 = require('merge2');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var minify = require('gulp-minify');
var gzip = require('gulp-gzip');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var growl = require('gulp-notify-growl');
var watch = require('gulp-watch');

var script = './src/poi.js';
var distPath = './dist/';

gulp.task('build', function () {
    return merge2(gulp.src([
        './node_modules/atomicjs/dist/atomic.js',
        './src/poi-reusable.js',
        './src/poi-dom.js',
        './src/poi-hotspot.js',
        './src/poi-area-interest.js',
        './src/poi.js'
    ])
        .pipe(plumber(function (error) {

        }))
        .pipe(concat('poi-lib.js'))
        .pipe(gulp.dest(distPath))
        .pipe(minify({
            noSource: true,
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest(distPath))
        .pipe(gzip())
        .pipe(gulp.dest(distPath))
    )
});


gulp.task('playground', ['build'], function () {
    gulp.src('dist/poi-lib.min.js')
            .pipe(gulp.dest('./examples/playground')
    )
});


gulp.task('jshint', function () {
    gulp.src('src/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({
            title: 'JSHint',
            message: 'JSHint Passed. All good!'
        }))
});

gulp.task('watch', ['playground'], function () {
    watch(['./src/*.js'], function () {
        gulp.start('build');
    });
});

gulp.task('default', ['playground']);