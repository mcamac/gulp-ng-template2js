var ngTemplate2Js = require('../');

var chai = require('chai');
var File = require('gulp-util').File;
var gulp = require('gulp');
var path = require('path');
require('mocha');
var fixtures = function (glob) {
  return path.join(__dirname, 'fixtures', glob);
}

describe('gulp-ng-template2js', function () {
  describe('templateToJs', function () {
    it('should ignore null files', function (done) {
      var stream = ngTemplate2Js({});

      stream.write(new File());
      stream.end();
    });

    it('should emit error on streaming', function (done) {
      gulp.src(fixtures('*'), { buffer: false })
        .pipe(ngTemplate2Js({}))
        .on('error', function (err) {
          chai.expect(err.message).to.equal('Streaming not supported');
          done();
        });
    });
  });
});
