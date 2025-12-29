const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const readline = require("readline");

const PROTO_PATH = path.join(__dirname, "greeter.proto");

const packageDefination = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefination).greeter;

const username = process.argv[2] || "unknow";

function main() {
  const client = new proto.Greeter(
    "localhost:5050",
    grpc.credentials.createInsecure(),
  );
  // client.SayHello({ name: "Goldman" }, (err, response) => {
  //   if (err) console.error(err);
  //   else console.log(response.message);
  // });
  // const call = client.GetNumbers({ count: 100 });
  // call.on("data", (response) => {
  //   console.log(`Order ${response.order} - Number % ${response.number}`);
  // });

  // call.on("end", () => {
  //   console.log("Stream ended...");
  // });
  // const call = client.SumNumbers((err, response) => {
  //   if (err) return console.log(err);
  //   console.log("Sum: ", response.sum);
  // });

  // call.write({ number: 5 });
  // call.write({ number: 5 });
  // call.write({ number: 5 });
  // call.write({ number: 5 });

  // call.end();
  // const call = client.Chat();
  // call.on("data", (chatMessage) => {
  //   console.log(`${chatMessage.user}: ${chatMessage.message}`);
  // });

  // call.write({ user: "Goldman", message: "Olia" });
  // call.write({ user: "Goldman", message: "Ou mi" });

  // setTimeout(() => {
  //   call.end();
  // }, 3000);

  // call.on("end", () => {
  //   console.log("Stream closed...");
  // });
  //

  const call = client.Chat();
  call.on("data", (chatMessage) => {
    const time = new Date(Number(chatMessage.timestamp)).toLocaleTimeString();
    console.log(`[${time}]-${chatMessage.user}: ${chatMessage.message}`);
  });

  // call.write({ user: "Goldman", message: "Olia" });
  // call.write({ user: "Goldman", message: "Ou mi" });

  // setTimeout(() => {
  //   call.end();
  // }, 3000);

  call.on("end", () => {
    console.log("Stream closed...");
    process.exit(0);
  });

  call.on("error", (error) => {
    console.error("*************", error.message);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Start chatting(Type /exit to leave):");
  rl.on("line", (line) => {
    if (line.trim() == "/exit") {
      call.end();
      rl.close();
      return;
    }
    call.write({
      user: username,
      message: line,
      timestamp: Date.now(),
    });
  });
}

main();
