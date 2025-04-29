require("dotenv").config();

const connect = require("./connect");

const app = require("./src/app");

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

connect.mongo(process.env.MONGO_PROD_DB);
connect.neo(process.env.NEO4J_PROD_DB);