const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

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

  cluster.on('exit', (deadWorker) => {
    // Restart the worker
    const worker = cluster.fork();

    // Note the process IDs
    const oldPID = deadWorker.process.pid;
    const newPID = worker.process.pid;

    // Note the old workers port and ID
    const oldPort = workers[oldPID].port;
    const oldId = workers[oldPID].id;
    const deathCount = workers[oldPID].deathCount + 1;

    // Delete the old worker object
    delete workers[oldPID];

    // Add the new worker object
    workers[newPID] = {
      port: oldPort,
      worker,
      id: oldId,
      deathCount,
    };

    worker.send({
      port: oldPort,
      id: oldId,
    });

    // Log the event
    console.group('WORKER DIED');
    const details = [
      {
        OldPID: oldPID,
        NewPID: newPID,
        PORT: oldPort,
        ID: oldId,
        DeathCount: deathCount,
      },
    ];
    console.table(details);
    console.groupEnd();
  });
}

if (cluster.isMaster) {
  masterProcess();
} else {
  require('./spawn')();
}
