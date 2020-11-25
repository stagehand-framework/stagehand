const process = require('process');
const rl = require('readline');
const std = process.stdout;

const startSpinner = () => {
  // Remove cursor
  process.stdout.write("\x1B[?25l");

  const spinners = ['=', '\\', '|', '/'];

  let idx = 0;
  const terminalWidth = process.stdout.columns;
  const line = '-'.repeat(terminalWidth);
  
  return setInterval(() => {
    const linePos = idx % line.length;
    const spinner = spinners[idx % spinners.length];

    spinnerLine = line.slice(0, linePos) + spinner + line.slice(linePos, -1);

    std.write(spinnerLine);

    // Move cursor to start of line
    rl.cursorTo(std, 0);

    idx += 1;
  }, 100);
};

const stopSpinner = (id) => {
  clearInterval(id);
  const terminalWidth = process.stdout.columns;  
  std.write(' '.repeat(terminalWidth));
  // Bring back cursor
  process.stdout.write("\x1B[?25h")
}

module.exports = {
  startSpinner,
  stopSpinner,
};