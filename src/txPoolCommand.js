exports.TxPool = (function() {
    const { spawn } = require("child_process");
    require('dotenv').config();
    let transactions = [];
    let knownTransactions = [];
    let busy = false;
    let lastPruning = Date.now();
    const PRUNE_INTERVAL = process.env.GRPC_URL ? parseInt(process.env.PRUNE_INTERVAL) : 20*60*1000;

    async function subscribe() {
        const ls = spawn("dogechain", ["txpool", "subscribe", process.env.GRPC_URL || '127.0.0.1:9632']);

        ls.stdout.on("data", function (data) {
            //console.log(`stdout: ${data}`);
            getHashes(data);
        });

        ls.stderr.on("data", function (data) {
            console.log(`stderr: ${data}`);
        });

        ls.on('error', function (error) {
            console.log(`error: ${error.message}`);
        });

        ls.on("close", function(code) {
            console.log(`child process exited with code ${code}`);
            setTimeout(subscribe, process.env.RECONNECT_TIMEOUT ? parseInt(process.env.RECONNECT_TIMEOUT) : 500);
        });
    }

    function getHashes(data) {
        if(data) {
            const dataStr = `${data}`;
            const lines = dataStr.split('\n');

            lines.forEach(function (line) {
                if(line.toLowerCase().startsWith('hash')) {
                    const tokens = line.split(' ');

                    tokens.forEach(function (token) {
                        if(token.startsWith('0x')) {
                            //console.log(token);

                            if(!transactions.map(function (tx) { return tx.hash; }).includes(token)) {
                                transactions.push({hash: token, timestamp: Date.now()});
                            }
                        }
                    });
                }
            })
        }

        // default 20 min prune interval
        const now = Date.now();

        if(now > (lastPruning + PRUNE_INTERVAL)) {
            pruneHashes(now);
        }
    }

    function pruneHashes(now) {
        busy = true;
        const keepTransactions = [];

        transactions.forEach(function (tx) {
           if(tx.timestamp > lastPruning && !knownTransactions.includes(tx.hash))  {
               keepTransactions.push(tx);
           }
        });

        transactions = keepTransactions;
        knownTransactions = [];
        lastPruning = now;
        busy = false;
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

    function getNewTransactions() {
        if(busy) {
            return [];
        }

        const _transactions = [];

        transactions.forEach(function (tx) {
            if(!knownTransactions.includes(tx.hash)) {
                _transactions.push(tx.hash);
                knownTransactions.push(tx.hash);
            }
        })

        return _transactions;
    }

    return {
        getNewTransactions: getNewTransactions,
    }
})();


