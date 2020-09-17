'use strict';
var gulp = require('gulp');
var merge2 = require('merge2');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var gzip = require('gulp-gzip');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var watch = require('gulp-watch');

var distPath = './dist/';

gulp.task('build', function (done) {
    merge2(gulp.src([
            './node_modules/atomicjs/dist/atomic.js',
            './src/poi-reusable.js',
            './src/poi-dom.js',
            './src/poi-hotspot.js',
            './src/poi-polygon.js',
            './src/poi-ajax.js',
            './src/poi.js'
        ], {
            allowEmpty: true
        })
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

    done();
});


gulp.task('playground', gulp.series('build'), function () {
    gulp.src('dist/poi-lib.min.js')
        .pipe(gulp.dest('./examples/playground'))
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

gulp.task('watch', gulp.series('playground'), function (done) {
    watch(['./src/*.js'], function () {
        gulp.start('build');
    });

    done()
});

gulp.task('default', gulp.series('playground'));