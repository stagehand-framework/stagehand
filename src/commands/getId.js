const { stagehandErr, stagehandSuccess, stagehandWarn } = require("../util/logger");
const { getCanonicalId } = require("../aws/getId");
const { wrapExecCmd } = require("../util/wrapExecCmd");

const getId = (args) => {
  try {
    wrapExecCmd(getCanonicalId).then(id => {
      stagehandSuccess(id.trim(), 'Id retrieved:');
      stagehandWarn('Give this Id to another user to give you access to a stagehand stack');

    })
  } catch (err) {
    stagehandErr('Could not retrieve Id');
  }
};

module.exports = { getId }