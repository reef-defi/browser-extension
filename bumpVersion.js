var fs = require('fs');
var NEW_VERSION = '1.0.9';

function getPackageJson(filePath){
  return  {json: JSON.parse(fs.readFileSync(filePath, 'utf8')), filePath:filePath};
}

function setPackageJson(filePath, json){
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

var packageNames = [
  'extension',
  'extension-base',
  'extension-chains',
  'extension-compat-metamask',
  'extension-dapp',
  'extension-inject',
  'extension-ui',
]

function getPackageJsonPaths(pkgNames) {
  var packages = pkgNames.map((name) => `./packages/${name}/package.json`);
  return ['package.json', ...packages];
}

function updateVersions(json, pkgNames, ver) {
  console.log("IN PACKAGE=",json.name);
  json.version = ver;
  pkgNames.forEach((name)=>{
    let depName = `@reef-defi/${name}`;
    let toVersion = `^${ver}`;
    let dependency = json.dependencies && json.dependencies[depName];
    if(dependency)console.log("bumping=", depName, ' to ', toVersion);

    if (dependency) {
      json.dependencies[depName] = toVersion;
    }
  })
  return json;
}

getPackageJsonPaths(packageNames).map(getPackageJson).forEach((json_file)=>{
  updateVersions(json_file.json, packageNames, NEW_VERSION);
  setPackageJson(json_file.filePath, json_file.json);
})
