'use strict';

var path = require('path');
var fs = require('fs');
var proc = require('child_process');
var nex = require('nex-api');
var github = require('nex-github');
var _ = require('lodash');
var targz = require('tar.gz');
var rimraf = require('rimraf');
var log = require('npmlog');

var handler = module.exports = new nex.Handler('repository');

/**
 * @override
 */
handler.do = function (pkg) {
  let packageName = pkg.name + '-' + pkg.version;
  let repository = pkg[this.field];

  // skip, if already cloned
  if (fs.existsSync(path.resolve(process.cwd(), '.git'))) {
    log.info(packageName, 'found existing .git directory. skipping');
    return;
  }

  github.getRelease(repository)
  .then(function (tarball) {
    log.info('tarball', 'extracting', tarball);

    new targz().extract(tarball, path.resolve(process.cwd(), 'extract'), function (err) {
      if (err) return log.error('extract', err);

      log.info('tarball', 'extracted');

      proc.execSync([ 'cp -r', path.resolve('extract', packageName, '*'), process.cwd() ].join(' '));
      rimraf.sync(path.resolve(process.cwd(), 'extract'));
      rimraf.sync(path.resolve(process.cwd(), packageName + '.tar.gz'));
    }); 
  },  
  function () {
    log.error('install', 'Failed to download', pkg.name, 'Please try again');
    process.exit(1);
  }); 
};

/**
 * @override
 */
handler.undo = function (pkg) {
  rimraf.sync('node_modules');
};
