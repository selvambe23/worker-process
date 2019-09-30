# Worker Code Challenge

## About
This coding challange is about managing and scalaing a 3rd party worker application in order to compute a sequence of random numbers within a defined time constraint. 

## Challenge Goals
The goal of the challenge is to see how would you approach a problem, break it down and design a solution for it. That being said, here’s some expected goals to be achieved:
* Document your proposed solution
* Good and understandable code architecture 
* A clear work history (Please use Git)
* Well documented code
* Well tested code

## What will you build
We would like you to write a program that uses the enclosed worker binary to compute 150 data samples. Your programm needs to spawn and manage multiple worker (child) processes. The worker provides a http streaming interface to provide the computed numbers with a throughput of 1 rnd/sec. You can have only one connection per worker. A worker might crash after some time.

### Expectation
* write a component to manage the worker processes
* handle the http connections and consume the generated numbers
* collect a total amount of 150 data samples
* compute the total count of numbers you processed
* compute the total time spent
* [optional] scale the system to compute 150 numbers within 10sec
* [optional] scale the system with a max of 16 workers


### The Worker
The worker can be find enclosed (`bin/worker`), it's a compiled go application.

### Start
`./worker -workerId 1 -port 3001`

### API
`http://localhost:3001/rnd?n=100`

`n` defines the number of random numbers the worker will generate.

The endpoint has a throughput of 1 rnd/sec. It's a chunked http stream.

Example Response
```bash
HTTP/1.1 200 OK
Cache-Control: no-cache
Connection: keep-alive
Content-Type: application/text
X-Worker-Id: 1
Date: Wed, 28 Aug 2019 21:30:01 GMT
Transfer-Encoding: chunked

rnd=97
rnd=18
rnd=21
rnd=95
rnd=33
```

## Implementation Technology
Please feel free to use any of the following technologies that you might find fun, or consider yourself proficient in or comfortable with.
* Node.JS (Javascript, Typescript, ReasonML) 
* Golang
* Java
* Python

Please feel free to use any framework, or no-framework.

## Completion Time
Within a maximum of 7 Days.

## Delivery
Please provide access to your code through a Github, GitLab or a Bitbucket repository.
