const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const axios = require('axios');
const fs = require('fs');

const workers = {};
const sampleToGather = 150;
const samples = [];

/**
 * The master process will spawn the required number of child processes.
 * The master process will also take care of spawning any child process upon exit.
 * The master process will also start requesting the processes and aggregate
 * the data and saving it to a file.
 */
function masterProcess() {
  console.log(`Master ${process.pid} is running`);
  const start = new Date().getTime();
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

    // send the worker the same port and id it used to work
    worker.send({
      port: oldPort,
      id: oldId,
    });

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


  cluster.on('message', (_worker, runningPort) => {
    // Give a buffer time for the process to actually start up and start accepting requests
    setTimeout(async () => {
      // console.log(port);

      // Hit the API to get stream data
      const response = await axios({
        method: 'get',
        responseType: 'stream',
        url: `http://localhost:${runningPort}/rnd?n=5`, // 5 random numbers per request
      });

      response.data.on('data', (data) => {
        samples.push(data.toString()); // get the data and append to samples
        if (samples.length >= sampleToGather) {
          // once all required data is gathered log it to file
          fs.writeFileSync('random.txt', samples.join(''));
          const end = new Date().getTime();
          // Finally log all the worker stats
          console.group('WORKERS FINAL STATS');
          console.table(
            Object.keys(workers)
              .map((key) => {
                const w = workers[key];
                return {
                  PORT: w.port,
                  ID: w.id,
                  DeathCount: w.deathCount,
                };
              })
              .sort((a, b) => a.PORT - b.PORT),
          );
          // Log the time taken
          console.log(`Time Taken: ${end - start}ms.`);
          console.groupEnd();
          process.exit();
        }
      });
    }, 10);
  });
}

if (cluster.isMaster) {
  masterProcess();
} else {
  // Spawn child processes
  require('./spawn')();
}
