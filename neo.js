const neo4j = require("neo4j-driver");

function connect(dbName) {
    this.dbName = dbName;
    this.driver = neo4j.driver(
        process.env.NEO4J_URL,
        neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
}

function session() {
    return this.driver.session({
        database: this.dbName,
        defaultAccessMode: neo4j.session.WRITE,
    });
}

module.exports = {
    connect,
    session,
    dropAll: "MATCH(n) DETACH DELETE n",
    dropNode: "MATCH(n {id:$id}) DETACH DELETE n",
    purchase: "MERGE (exhibition:Exhibition {id:$exhibitionId}) MERGE (user:User {id:$userId}) MERGE (user)-[:BOUGHT_TICKET]->(exhibition)",
    sendFriendRequest: "MERGE (user1:User {id:$user1Id}) MERGE (user2:User {id:$user2Id}) MERGE (user1)-[:SEND_FRIEND_REQUEST]->(user2)",
    acceptRequest: "MERGE (user1:User {id:$id}) MERGE (user2:User {id:$sendId}) MERGE (user1)-[:IS_FRIEND]->(user2)",
    removeFriend: "MATCH (u:User {id: $id})-[r:IS_FRIEND]-(reqUser:User {id: $friendId}) DELETE r",
    deletePurchases: "MATCH(exhibition:Exhibition {id:$exhibitionId}) DETACH DELETE exhibition",
    getNotBought: "MATCH (usr:User {id:$userId})-[:BOUGHT_TICKET*3]-(exhibition:Exhibition) WHERE NOT (usr)-[:BOUGHT_TICKET]->(exhibition) RETURN collect(DISTINCT exhibition.id) as exhibitionIds",
    visitedByFriends: "MATCH (usr:User {id:$userId})-[:IS_FRIEND]-(u2:User)-[:BOUGHT_TICKET]->(exhibition) WHERE NOT (usr)-[:BOUGHT_TICKET]-(exhibition) RETURN collect(DISTINCT exhibition.id) as exhibitionIds"
};