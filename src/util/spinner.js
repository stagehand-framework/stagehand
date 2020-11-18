const process = require('process');
const rl = require('readline');
const std = process.stdout;

const startSpinner = () => {
  process.stdout.write("\x1B[?25l");

  const spinners = ['=', '\\', '|', '/'];

  let idx = 0;
  const line = '-'.repeat(30);

  return setInterval(() => {
    const linePos = idx % line.length;
    const spinner = spinners[idx % spinners.length];

    spinnerLine = line.slice(0, linePos) + spinner + line.slice(linePos, -1);

    std.write(spinnerLine);

    rl.cursorTo(std, 0);

    idx += 1;
  }, 100);
};

const stopSpinner = (id) => {
  clearInterval(id);
  process.stdout.write("\x1B[?25h")
}

module.exports = {
  startSpinner,
  stopSpinner,
}

// while (idx < 100) {
//   let spinnerLine = line
//   spinnerLine[idx % line.length] = spinners[idx % spinners.length];

//   idx+=1;
//   console.log(spinnerLine);
// }