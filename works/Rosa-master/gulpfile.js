'use strict';
const gulp = require('gulp');
const sass 	  = require('gulp-sass');
const watch 	  = require('gulp-watch');
const sourcemaps  = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat 	  = require('gulp-concat');
const uglify  = require('gulp-uglify-es').default;


const rename 	  = require('gulp-rename');
const del 	      = require('del');
const autoprefixer = require('gulp-autoprefixer');
const gutil       = require('gulp-util');


gulp.task('sass-compile', function(){
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 30 version', '>2%', 'ie 8'], {cascade: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/css/'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function(){
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify : false
    })
});
gulp.task('watch', function(){
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass-compile'));
    gulp.watch('./src/*.html', browserSync.reload);
    gulp.watch('./src/js/*.js', browserSync.reload);
});


gulp.task('default', gulp.parallel('browser-sync', 'watch'))
gulp.task('build', gulp.series('sass-compile', async function(){
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('docs/js'));
    gulp.src('src/css/*.css')
        .pipe(gulp.dest('docs/css'));
    gulp.src('src/slick/*.*')
        .pipe(gulp.dest('docs/slick'));
    gulp.src('src/img/*.*')
        .pipe(gulp.dest('docs/img'));
    gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('docs/fonts'));
    gulp.src('src/*.html')
        .pipe(gulp.dest('docs'));
}));

