const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
/**
 * Checks the current os the process is running on
 * And returns the appropriate filename.
 *
 * @returns Relative file path depending upon the os.
 */
function workerName() {
  switch (os.platform()) {
    case 'win32':
      return path.resolve(__dirname, 'bin/worker.windows');
    case 'linux':
      return path.resolve(__dirname, 'bin/worker.linux');
    case 'darwin':
      return path.resolve(__dirname, 'bin/worker.mac');
    default:
      return path.resolve(__dirname, 'bin/worker.windows');
  }
}

/**
 * Spawn the child process with the given id and port.
 *
 * @param startMsg Required options to spawn the process.
 * @param startMsg.id The worker id to spawn the process in.
 * @param startMsg.port The port number for the worker to start in.
 */
function spawnWorker(startMsg) {
  const serverSpawnProcess = spawn(workerName(), [
    '-workerId',
    startMsg.id,
    '-port',
    startMsg.port,
  ]);
  serverSpawnProcess.on('exit', () => {
    process.exit();
  });
  serverSpawnProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  serverSpawnProcess.stderr.on('data', (data) => {
    if (data.includes('started')) {
      process.send(startMsg.port);
    }
    console.log(`stdout: ${data}`);
  });
}

module.exports = function childProcess() {
  process.on('message', (startMsg) => {
    // Spawn a worker with the given config
    spawnWorker(startMsg);
  });
};
