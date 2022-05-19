const http = require('http');
const app = require('./app');

// ============================================
// normalizePort renvoie un port valide
const normalizePort = value => {
    const port = parseInt(value, 10);

    if(isNaN(port)) {
        return value;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || 3000);
app.set('port', port);

// ===============================
// Recherche les différentes erreurs et les gère de manère
// appropriées. Elle est ensuite enregistré dans le serveur
const errorHandler = error => {
    if(error.syscall !== 'listen') {
        throw error;
    }

    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe' + address : 'port' + port;

    switch(error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges. ');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use. ');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const server = http.createServer(app);

// Un écouteur d'évenement est également enregistré, consignant
// le port ou le canal nommé sur lequel le serveur s'execute
server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);