'use strict';

var args = process.argv;
var lastArg = args[args.length - 1];
var letsUglify = (lastArg && lastArg == '--uglify');

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    strip = require('gulp-strip-comments'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    //sass = require('gulp-sass'),
    gzip = require('gulp-gzip'),
    cssmin = require('gulp-clean-css'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'backend/public/',
        js: 'backend/public/js/',
        css: 'backend/public/css/',
        img: 'backend/public/img/',
        fonts: 'backend/public/fonts/'
    },
    src: {
        html:   'frontend/**/*.html',
        js:     'frontend/js/_*.js',
        style:  'frontend/css/_*.css',
        img:    'frontend/img/**/*.*',
        fonts:  'frontend/fonts/**/*.*'
    },
    watch: {
        html:   'frontend/**/*.html',
        js:     'frontend/js/**/*.js',
        style:  'frontend/css/*.css',
        img:    'frontend/img/**/*.*',
        fonts:  'frontend/fonts/**/*.*'
    },
    clean: './backend/public'
};

var config = {
    server: {
        baseDir: "./backend/public"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "avenue-Log_"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(strip())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    var pipe = gulp.src(path.src.js).pipe(rigger());

    if (letsUglify) {
        pipe = pipe.pipe(uglify());
    }
    pipe.pipe(gulp.dest(path.build.js))
        //.pipe(sourcemaps.init())
        //.pipe(sourcemaps.write())
        .pipe(reload({stream: true}));

});

gulp.task('css:build', function () {
    gulp.src(path.src.style)
       // .pipe(sourcemaps.init())
        .pipe(cssmin())
       // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('build', [
    'html:build',
    'js:build',
    'css:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('default', ['build', 'webserver', 'watch']);