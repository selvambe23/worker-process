const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

let workers = {};
if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}

function masterProcess() {
  console.log(`Master ${process.pid} is running`);
  let port = 3000;
  // Fork workers. One per CPU for maximum effectiveness
  for (var i = 0; i < Math.max(numCPUs * 4, 16); i++) {
    port += 1;
    const worker = cluster.fork();
    workers[worker.process.pid] = {
      port,
      worker,
      id: i + 1,
      deathCount: 0
    };
    worker.send({
      port,
      id: i + 1
    });
  }
}

function childProcess() {
    console.log(`Child ${process.pid} is running`);
    process.on("message", function(startMsg) {
      // Spawn a worker with the given config
      console.log(startMsg);
    });
}