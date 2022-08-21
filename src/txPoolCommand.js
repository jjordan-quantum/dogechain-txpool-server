const { spawn } = require("child_process");
require('dotenv').config();

async function subscribe() {
    const ls = spawn("dogechain", ["txpool", "subscribe", process.env.GRPC_URL || '127.0.0.1:9632']);

    ls.stdout.on("data", data => {
        //console.log(`stdout: ${data}`);
        getHashes(data);
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

function getHashes(data) {
    if(data) {
        const dataStr = `${data}`;
        const lines = dataStr.split('\n');

        lines.forEach((line) => {
            if(line.toLowerCase().startsWith('hash')) {
                const tokens = line.split(' ');

                tokens.forEach((token) => {
                   if(token.startsWith('0x')) {
                       console.log(token);
                   }
                });
            }
        })
    }
}

(async () => {
    await subscribe();
})();

