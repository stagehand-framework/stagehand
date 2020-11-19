const { exec } = require("child_process");
const { stagehandErr } = require('../util/logger');

const wrapExecCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      if (stderr) {
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
}

module.exports = {
  wrapExecCmd
}