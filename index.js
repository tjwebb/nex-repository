'use strict';

var path = require('path');
var fs = require('fs');
var nex = require('nex-api');
var github = require('nex-github');
var _ = require('lodash');
var log = require('npmlog');

var handler = module.exports = new nex.Handler('repository');

/**
 * @override
 */
handler.do = function (pkg) {
  let packageName = pkg.name + '-' + pkg.version;
  let repository = _.defaults({ version: pkg.version, target: process.cwd() }, pkg[this.field]);

  // skip, if already installed from git
  if (fs.existsSync(path.resolve(process.cwd(), '.npmignore'))) {
    log.info(packageName, 'found existing github release. skipping github download');
    return;
  }

  github.getRelease(repository).then(function () {
    github.extractRelease.sync(repository);
  });
};

/**
 * @override
 */
handler.undo = function (pkg) {

};
