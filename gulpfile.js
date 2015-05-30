'use strict';

var gulp = require('gulp');
var del = require('del');
var Builder = require('systemjs-builder');
var ts = require('gulp-typescript');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function (done) {
  del(['dev'], done);
});

gulp.task('build:websocket', function () {
  var builder = new Builder({
    paths: {
      'fxos-websocket/*': 'components/fxos-websocket-server/src/*.js',
      'EventDispatcher': 'components/event-dispatcher-js/event-dispatcher.es6.js'
    }
  });

  return builder.build(
    'fxos-websocket/server.es6', './lib/fxos-websocket-server.js', {}
  );
});

gulp.task('build:angular2', function () {
  var builder = new Builder({
    paths: {
      'angular2/*': 'node_modules/angular2/es6/prod/*.es6',
      rx: 'node_modules/angular2/node_modules/rx/dist/rx.js'
    }
  });
  return builder.build('angular2/angular2', './lib/angular2.js', {});
});

gulp.task('build:lib', ['build:angular2', 'build:websocket'], function () {
  gulp.src([
    './node_modules/angular2/node_modules/traceur/bin/traceur-runtime.js',
    './node_modules/angular2/node_modules/zone.js/dist/zone.js',
    './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js',
    './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js.map',
    './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
    './node_modules/reflect-metadata/Reflect.js',
    './node_modules/reflect-metadata/Reflect.js.map',
    './node_modules/systemjs/dist/system-csp.js',
    './node_modules/systemjs/dist/system-csp.js.map',
    './node_modules/systemjs/dist/system-csp.src.js'
  ]).pipe(gulp.dest('./lib'));
});

var tsProject = ts.createProject('.tsrc', {
  typescript: require('typescript')
});

gulp.task('build:ts', ['clean'], function () {
  var result = gulp.src('./ts/**/*.ts')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject));

  return result.js
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dev'));
});

gulp.task('build', ['clean', 'build:ts'], function() {
  var builder = new Builder({
    baseURL: './dev/',
    meta: {
      'angular2/angular2': { build: false },
      'angular2/di': { build: false },
      'fxos-websocket/server.es6': { build: false }
    }
  });

  return builder.build(
    './app', './dev/app.js', {}
  );
});

gulp.task('default', ['build:lib', 'build'], function () {
  gulp.watch('./ts/**', ['build']);
});
