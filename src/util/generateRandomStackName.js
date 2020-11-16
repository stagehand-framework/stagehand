const { stagehandErr, stagehandLog } = require("./logger");

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

const generateRandomStackName = (len = 10) => {
  let i = 0;
  result = "";

  while (i < len) {
    result += String.fromCharCode(getRandomIntInclusive(97, 122));
    i += 1;
  }

  return result;
};

module.exports = { generateRandomStackName };
