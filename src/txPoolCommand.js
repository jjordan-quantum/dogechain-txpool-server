const { spawn } = require("child_process");
require('dotenv').config();

async function subscribe() {
    const ls = spawn("dogechain", ["txpool", "subscribe", process.env.GRPC_URL || '127.0.0.1:9632']);

    ls.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        setTimeout(subscribe, process.env.RECONNECT_TIMEOUT ? parseInt(process.env.RECONNECT_TIMEOUT) : 500);
    });
}

(async () => {
    await subscribe();
})();

