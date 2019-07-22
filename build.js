let os = require('os');
let exec = require('child_process').exec;

const callback = (err, stdout, stderr) => {
  if (err) {
    console.log('build error:' + stderr);
  } else {
    console.log('build success:' + stdout);
  }
}

if (os.platform().toLowerCase() === 'win32') {
  exec('rmdir /s /q lib & echo d|xcopy src lib /d /e', callback);
} else {
  exec('rm -rf lib && cp -rf src lib', callback);
}
