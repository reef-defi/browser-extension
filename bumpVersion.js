const fs = require('fs');
const NEW_VERSION = '1.0.23';

function getPackageJson (filePath) {
  return { json: JSON.parse(fs.readFileSync(filePath, 'utf8')), filePath: filePath };
}

function setPackageJson (filePath, json) {
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

const packageNames = [
  'extension',
  'extension-base',
  'extension-chains',
  'extension-compat-metamask',
  'extension-dapp',
  'extension-inject',
  'extension-ui'
];

function getPackageJsonPaths (pkgNames) {
  const packages = pkgNames.map((name) => `./packages/${name}/package.json`);

  return ['package.json', ...packages];
}

function updateVersions (json, pkgNames, ver) {
  console.log('IN PACKAGE=', json.name);
  json.version = ver;
  pkgNames.forEach((name) => {
    const depName = `@reef-defi/${name}`;
    const toVersion = `^${ver}`;
    const dependency = json.dependencies && json.dependencies[depName];

    if (dependency)console.log('bumping=', depName, ' to ', toVersion);

    if (dependency) {
      json.dependencies[depName] = toVersion;
    }
  });

  return json;
}

getPackageJsonPaths(packageNames).map(getPackageJson).forEach((jsonFileObj) => {
  updateVersions(jsonFileObj.json, packageNames, NEW_VERSION);
  setPackageJson(jsonFileObj.filePath, jsonFileObj.json);
});
