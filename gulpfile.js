var config;
var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var gulpif = require('gulp-if');
var minimist = require('minimist');

gulp.task('templates', function () {
    var compile_cmd_part = './node_modules/.bin/swig compile ';
    var wrap_cmd_part;

    config.core.themes.items.forEach(function (items) {
        fs.readdir(items.src, function(err, item) {
            for (var i=0; i<item.length; i++) {
                if(item[i].split('.')[1] === 'html'){
                    wrap_cmd_part = '--wrap-start="if(!tpl) { var tpl = {}; } tpl.' + items.name + '_' + item[i].split('.')[0] + '_tpl = " --wrap-end=";"';
                    gulp.src(items.src + item[i], {read: false})
                        .pipe(shell([
                            compile_cmd_part + items.src + item[i]
                                + ' --filters ./public/javascripts/chat/vendor/themes/default/filters/index.js '
                                + ' ' + wrap_cmd_part
                                + ' > ' + config.core.themes.src
                                + 'compiled/' + items.name
                                + '_' + item[i].split('.')[0]
                                + '_tpl.js'
                        ]));
                }
            }
        });
    });
});

gulp.task('scripts', function() {
    return gulp.src(config.core.js.src)
        .pipe(concat('fc.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./public/javascripts/chat/build/js'));
});

gulp.task('styles', function() {
    return gulp.src(config.core.css.src)
        .pipe(concat('fc.css'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./public/javascripts/chat/build/css'));
});

gulp.task('plugins', function() {
    console.log(plugins);
});

gulp.task('init-config', function() {
    var options = minimist(process.argv.slice(2));
    config = require('./public/javascripts/chat/gulp/config/' + options.config + '.json');
});

gulp.task('themes', ['init-config', 'templates']);
gulp.task('default', ['init-config', 'scripts', 'styles']);