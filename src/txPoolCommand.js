exports.TxPool = (function() {
    const { spawn } = require("child_process");
    require('dotenv').config();
    const transactions = [];
    const knownTransactions = [];

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
                            //console.log(token);

                            if(!transactions.includes(token)) {
                                transactions.push(token);
                            }
                        }
                    });
                }
            })
        }
    }

    (async () => {
        await subscribe();
    })();

    (async () => {
        while(true) {
            console.log(`Transactions array has ${transactions.length} elements`);

            await new Promise((resolve, reject) => {
                setInterval(() => { resolve(); }, 60 * 1000);
            });
        }
    })();

    const getNewTransactions = () => {
        const _transactions = [];

        transactions.forEach((tx) => {
            if(!knownTransactions.includes(tx)) {
                _transactions.push(tx);
                knownTransactions.push(tx);
            }
        })

        return _transactions;
    }

    return {
        getNewTransactions: getNewTransactions,
    }
})();


