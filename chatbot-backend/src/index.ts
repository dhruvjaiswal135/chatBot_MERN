import http from 'http';
import cluster from 'cluster';
import os from 'os';
import app from './app';
import {config} from './config/app';

const PORT = process.env.PORT || config.port ;
const ENV = process.env.NODE_ENV || 'development';

const startServer = () => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`🚀 Server started at http://127.0.0.1:${PORT} in ${ENV} environment check health at http://127.0.0.1:${PORT}/health`);
    });
};

if (ENV === 'production' && cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`🧑‍💻 Primary process ${process.pid} is running`);
    console.log(`🔧 Forking ${numCPUs} workers...`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
    cluster.on('listening', (worker, address) => {
        console.log(`🧑‍💻 Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`);
    });
} else {
    console.log(`🧑‍💻 Worker process ${process.pid} started`);
    startServer();
    console.log(`🔧 Registered routes:`, app._router.stack);

}