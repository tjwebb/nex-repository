'use strict';

var _ = require('lodash');
var nex = require('nex-api');
var targz = require('tar.gz');
var rimraf = require('rimraf');
var github = require('nex-github');
var path = require('path');
var proc = require('child_process');

var handler = module.exports = new nex.Handler('repository');

/**
 * @override
 */
handler.do = function (pkg) {
  let packageName = pkg.name + '-' + pkg.version;
  let repository = pkg[this.field];
  let self = this;

  github.getRelease(repository)
  .then(function (tarball) {
    self.log.info('tarball', 'extracting', tarball);

    new targz().extract(tarball, path.resolve(process.cwd(), 'extract'), function (err) {
      if (err) return self.log.error('extract', err);

      self.log.info('tarball', 'extracted');

      proc.execSync([ 'cp -r', path.resolve('extract', packageName, '*'), process.cwd() ].join(' '));
      rimraf.sync(path.resolve(process.cwd(), 'extract'));
      rimraf.sync(path.resolve(process.cwd(), packageName + '.tar.gz'));
    }); 
  },  
  function () {
    self.log.error('install', 'Failed to download', pkg.name, 'Please try again');
    process.exit(1);
  }); 

};

/**
 * @override
 */
handler.undo = function (pkg) {
  rimraf.sync('node_modules');
};
