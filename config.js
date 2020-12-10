const env = process.env.NODE_ENV || 'development';

let config = {
    development: {
        host: "0.0.0.0",
        port : 5000,
        server: "ws://127.0.0.1:5000"
    },
    production: {
        host: "0.0.0.0",
        port : 5000,
        server: "wss://node.ncloud.dev"
    }
}

module.exports = {
    host: () => {
        return config[env].host
    },
    port: () => {
        return config[env].port
    },
    server: () => {
        return config[env].server
    }
}
