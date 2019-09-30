# Worker Code Challenge - Architecture

## Installation and Running the code

To install and run the application first install [Node.js](https://nodejs.org/en/)

```shell
npm i
npm start
```

## Working

1. The master process will take care of the following things,
   - Spawning child processes.
   - Maintaining the list of child workers.
   - Respawning child processes upon child process exit.
   - Sending and managing port number and worker id for each of the child processes.
   - Aggregating the requested amount of random numbers.
   - Sending axios requests to each of the processes and aggregating the data.
   - Appending the aggregated data to a file in the local file system.
   - Logging the processing stats at the end of the master process.
2. The child process will take care of the following things,
   - Checking the current running OS.
   - Spawning the right worker file depending upon the OS.
   - Spawning the child process with the port and id received from the master process.
   - Sending the port and id to the master process upon failure.
