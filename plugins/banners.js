'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var parse = require('parse-copyright');
var banner = require('update-banner');
var hasBanner = require('has-banner');
var merge = require('merge-deep');
var logger = require('../lib/logging');
var utils = require('../lib/utils');

module.exports = function(verb) {
  return function(options) {
    var opts = merge({}, options);

    return through.obj(function (file, enc, cb) {
      if (file.isNull() || !file.isBuffer()) {
        this.push(file);
        return cb();
      }

      try {
        if (utils.contains(file.path, '.js')) {
          var str = file.contents.toString();
          var log = logger(str);

          if (hasBanner(str) || opts.banner) {
            var copyright = parse(str);
            if (copyright && copyright.length) {
              file.data.copyright = copyright[0];
            }
            str = banner(str, file.data);
            log.success(str, 'updated banners in', file.relative);
          }

          file.contents = new Buffer(str);
        }
      } catch (err) {
        this.emit('error', new gutil.PluginError('update:banners', err));
        return cb();
      }

      this.push(file);
      cb();
    });
  };
};
