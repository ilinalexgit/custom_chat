var config = require('./public/javascripts/chat/gulp/config/client.json');
var gulp = require('gulp');
var path = require('path');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
//var jshint = require('gulp-jshint');
//var less = require('gulp-less');
var rename = require('gulp-rename');
var shell = require('gulp-shell');

gulp.task('compile_templates', shell.task([
    'echo hello'
]));

gulp.task('scripts', function() {
    //console.log(config.core);
    return gulp.src(config.core.js.src.concat(config.core.plugins.src))
        .pipe(concat('all.js'))
        //.pipe(uglify())
        //.pipe(rename('all.min.js'))
        .pipe(gulp.dest('./public/javascripts/chat/build'));
});

gulp.task('default', ['scripts']);