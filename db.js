const {Client} = require("pg");

const client = new Client({
    user: "postgres",
    password: "password",
    database: "office",
    host: "localhost",
    port: 5432
});

module.exports = client;