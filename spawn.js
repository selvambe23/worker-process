const { spawn } = require('child_process');


const spawnWorker = function (startMsg) {
  const serverSpawnProcess = spawn('./bin/worker.mac', [
    '-workerId',
    startMsg.id,
    '-port',
    startMsg.port,
  ]);
  serverSpawnProcess.on('exit', (code) => {
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
};

module.exports = function childProcess() {
  process.on('message', (startMsg) => {
    // Spawn a worker with the given config
    spawnWorker(startMsg);
  });
};
