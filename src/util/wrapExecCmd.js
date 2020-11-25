const { exec } = require("child_process");
const { stagehandErr } = require('../util/logger');

const wrapExecCmd = (cmd, errMsg) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(errMsg || error);
        return;
      }

      if (stderr) {
        reject(errMsg || stderr);
        return;
      }

      resolve(stdout);
    });
  });
}

module.exports = {
  wrapExecCmd
}