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

if (cluster.isMaster) {
  masterProcess();
} else {
  require('./spawn')();
}
