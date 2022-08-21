exports.Server = (function() {
    const { TxPool } = require('./txPoolCommand');
    require('dotenv').config();

    //==================================================================================================================
    //
    // EXPRESS APP
    //
    //==================================================================================================================

    const express = require('express')
    const bodyParser = require('body-parser')

    // INITIALIZE EXPRESS APP
    //==================================================================================================================

    const app = express();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8546;
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/', (req, res) => {
        res.send({
            transactions: TxPool.getNewTransactions()
        });
    })

    app.listen(port, () => {
        console.log("Listening on port: " + port);
    })

    return {}
})();