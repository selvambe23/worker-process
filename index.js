const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const { spawn } = require('child_process');

const workers = {};

function masterProcess() {
  console.log(`Master ${process.pid} is running`);
  let port = 3000;
  // Fork workers. One per CPU for maximum effectiveness
  for (let i = 0; i < Math.max(numCPUs * 4, 16); i += 1) {
    port += 1;
    const worker = cluster.fork();
    workers[worker.process.pid] = {
      port,
      worker,
      id: i + 1,
      deathCount: 0,
    };
    worker.send({
      port,
      id: i + 1,
    });
  }
}

function childProcess() {
  console.log(`Child ${process.pid} is running`);
  process.on('message', (startMsg) => {
    // Spawn a worker with the given config
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
  });
}

if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}
