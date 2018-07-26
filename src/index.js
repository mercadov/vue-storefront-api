import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from 'config';
import img from './api/img';
import https from 'https';
import fs from 'fs';

let app = express();

if (process.env.STOREFRONT_API_SSL_ENABLED) {
    var sslOptions = {
      key: fs.readFileSync(process.env.STOREFRONT_API_SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.STOREFRONT_API_SSL_CERT_PATH)
    };

    https.createServer(sslOptions, app);
} else {
    app.server = http.createServer(app);
}

// logger
app.use(morgan('dev'));

app.use('/media', express.static(__dirname + config[config.platform].assetPath))

// 3rd party middleware
app.use(cors({
    exposedHeaders: config.corsHeaders,
}));

app.use(bodyParser.json({
    limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

    // internal middleware
    app.use(middleware({ config, db }));

    // api router
    app.use('/api', api({ config, db }));
    app.use('/img', img({ config, db }));

    const port = process.env.PORT || config.server.port
    const host = process.env.HOST || config.server.host
    app.server.listen(port, host, () => {
        console.log(`Vue Storefront API started at http://${host}:${port}`);
    });
});

export default app;
