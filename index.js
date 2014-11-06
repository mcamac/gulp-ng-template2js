'use strict';

var path = require('path');
var jade = require('jade');
var through = require('through');
var _ = require('lodash');

function hasJadeExt(filepath) {
  return /\.jade$/.test(filepath);
}

var lastFile;

var TEMPLATE_MODULE_STR =
  'angular.module("${moduleName}", []).run(["$templateCache", function ($templateCache) {\n' +
  '  $templateCache.put("${moduleName}",\n' +
  '${templateHtml}\n' +
  '  );\n' +
  '}]);\n';

var templateModuleTemplate = _.template(TEMPLATE_MODULE_STR);

var topLevelModuleTemplate = _.template('angular.module("${moduleName}", [${modules}]);');

function strToJs(str, indent) {
  var strIndent = Array(indent + 1).join(' ');
  return _.map(str.split('\n'), function (line) {
    return strIndent + '"' + line.replace(/"/g, '\\"') + '"';
  }).join(' +\n');
}

module.exports = function (opts) {

  var templateModules = '';
  var templateModuleNames = [];

  function templateToJs(file, callback) {
    if (file.isStream()) {
      throw Error('gulp-ng-template2js does not support streaming.');
    }

    if (file.isBuffer()) {
      var contentStr = file.contents.toString();
      if (hasJadeExt(file.path)) {
        contentStr = jade.render(contentStr, { pretty: true });
      }

      var templateModuleName = path.relative(opts.relativeDir, file.path);

      templateModules += templateModuleTemplate({
        moduleName: templateModuleName,
        templateHtml: strToJs(contentStr, 4)
      });

      templateModuleNames.push(templateModuleName);


      lastFile = file;
    }
  }

  function endStream() {
    var topLevelModule = topLevelModuleTemplate({
      moduleName: opts.name,
      modules: _.map(templateModuleNames, function (name) { return '"' + name + '"'; }).join(', ')
    });

    lastFile.contents = new Buffer(topLevelModule + '\n' + templateModules);

    this.emit('data', lastFile);
    this.emit('end');
  }


  return through(templateToJs, endStream);
}
