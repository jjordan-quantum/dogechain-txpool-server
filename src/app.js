(async () => {
    require('./server');
    require('./memoryMetrics');
})()
    .catch((err) => console.log(err));