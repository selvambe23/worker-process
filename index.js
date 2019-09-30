const cluster = require("cluster");

if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}

function masterProcess() {
    console.log(`Master ${process.pid} is running`);
}

function childProcess() {
    console.log(`Child ${process.pid} is running`);
}