/* eslint-disable */
const fs = require('fs');

const buildDir = __dirname + '/build';

fs.readdir(buildDir, function (err, buildFilenames) {
  buildFilenames.forEach((path) => {
    if (path.endsWith('.html')) {
      const htmlFilePath = buildDir + '/' + path;
      const content = fs.readFile(htmlFilePath, function (_, content) {
        if (content.indexOf('<!--__EXTENSION_SRC_PATHS_PLACEHOLDER__-->') > -1) {
          const extDir = buildDir + '/extension-js';

          fs.readdir(extDir, function (err, filenames) {
            const fNames = filenames?.filter((f) => f.endsWith('.js'));

            if (fNames?.length) {
              const scripts = fNames.reduce((state, fName) => {
                return state += "<script src='./extension-js/" + fName + "'></script>";
              }, '');
              const replacedContent = content.toString().replace('<!--__EXTENSION_SRC_PATHS_PLACEHOLDER__-->', scripts);

              fs.writeFile(htmlFilePath, replacedContent, (err) => {
                err ? console.log('ERR Writing file=', err) : null;
              });
            }
          });
        }
      });
    }
  });
});
