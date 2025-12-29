const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { timeStamp } = require("console");
const path = require("path");
const { number } = require("zod");

const PROTO_PATH = path.join(__dirname, "greeter.proto");

const packageDefination = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefination).greeter;

function sayHello(call, callback) {
  const reply = { message: `Hello, ${call.request.name}` };
  callback(null, reply);
}

function getNumbers(call) {
  const count = call.request.count;
  let current = 1;
  const interval = setInterval(() => {
    if (current > count) {
      clearInterval(interval);
      call.end();
      return;
    }
    call.write({ order: current, number: current * 100 });
    current++;
  }, 1000);
}

function sumNumbers(call, callback) {
  let sum = 0;
  call.on("data", (request) => {
    sum += request.number;
  });

  call.on("end", () => {
    callback(null, { sum });
  });
}

const clients = [];

function chat(call) {
  clients.push(call);
  console.log("New client connected...");
  call.on("data", (chatMessage) => {
    console.log(`${chatMessage.user}: ${chatMessage.message}`);
    clients.forEach((client) => {
      if (client != call)
        client.write({
          user: chatMessage.user,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp,
        });
    });
  });
  call.on("end", () => {
    console.log("Client disconnected");
    clients.splice(clients.indexOf(call), 1);
    call.end();
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(proto.Greeter.service, {
    SayHello: sayHello,
    GetNumbers: getNumbers,
    SumNumbers: sumNumbers,
    Chat: chat,
  });
  server.bindAsync(
    `0.0.0.0:5050`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind", err);
        return;
      }
      console.log(`Server runnig on port ${port}`);
    },
  );
}

main();
