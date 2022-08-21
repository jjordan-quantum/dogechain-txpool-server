exports.MemoryManagerContainer = (function() {
    let usedHeapSize = 0;
    const start = Math.floor(Date.now() / 1000);

    const checkMemoryUsage = () => {

        const memoryUsage = process.memoryUsage();
        const heapTotal = parseInt(memoryUsage.heapTotal);

        const memStats = {
            heapUsed: "" + (parseInt(memoryUsage.heapUsed) / 1000000).toFixed(2) + "MB",
            heapTotal: "" + (parseInt(heapTotal) / 1000000).toFixed(2) + "MB"
        };

        console.log(memStats);
        const currentTime = Math.floor(Date.now() / 1000);
    }

    (async () => {
        while(true) {
            checkMemoryUsage();

            await new Promise((resolve, reject) => {
                setInterval(() => { resolve(); }, 60 * 1000);
            });
        }
    })();

    return {}
})();