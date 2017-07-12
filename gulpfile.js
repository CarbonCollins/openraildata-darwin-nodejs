'use strict'

const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
const rename = require('gulp-rename');
 
gulp.task('documentation', function () {
  return gulp.src('lib/**/*.js')
    .pipe(gulpJsdoc2md())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('jsdoc2md failed'), err.message)
    })
    .pipe(rename(function (path) {
      path.extname = '.md'
    }))
    .pipe(gulp.dest('docs'))
})