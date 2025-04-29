const chai = require("chai");
const expect = chai.expect;

const Exhibition = require("../models/exhibition.model")();

const requester = require("../../requester.spec");

const neo = require("../../neo");

let token;
let user1Id;

function createQueries(usId1, usId2, usId3, id1, id2, id3, id4) {
    return [
        `MERGE (u1:User {id: '${usId1}'}) MERGE (u2:User {id: '${usId2}'}) MERGE (u1)-[:IS_FRIEND]->(u2)`,
        `MERGE (u:User {id: '${usId2}'}) MERGE (e:Exhibition {id: '${id1}'}) MERGE (u)-[:BOUGHT_TICKET]->(e)`,
        `MERGE (u:User {id: '${usId2}'}) MERGE (e:Exhibition {id: '${id2}'}) MERGE (u)-[:BOUGHT_TICKET]->(e)`,
        `MERGE (u:User {id: '${usId1}'}) MERGE (e:Exhibition {id: '${id3}'}) MERGE (u)-[:BOUGHT_TICKET]->(e)`,
        `MERGE (u:User {id: '${usId3}'}) MERGE (e:Exhibition {id: '${id3}'}) MERGE (u)-[:BOUGHT_TICKET]->(e)`,
        `MERGE (u:User {id: '${usId3}'}) MERGE (e:Exhibition {id: '${id4}'}) MERGE (u)-[:BOUGHT_TICKET]->(e)`,
    ];
}

describe("recommendation routes", () => {
    describe("integration tests", () => {
        beforeEach(async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            token = res1.body.token;
            user1Id = res1.body._id;

            const res2 = await requester.post("/api/authentication/register").send({
                firstName: "David",
                lastName: "Man",
                email: "David@Man.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res3 = await requester.post("/api/authentication/register").send({
                firstName: "Jan",
                lastName: "Merick",
                email: "Jan@Merick.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const exhibit1 = new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });
            const exhibit2 = new Exhibition({
                name: "Rembrandt",
                description: "Rembrandt",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });
            const exhibit3 = new Exhibition({
                name: "Mondriaan",
                description: "Mondriaan",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });
            const exhibit4 = new Exhibition({
                name: "Van Gogh",
                description: "Van Gogh",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });

            await Promise.all([
                exhibit1.save(),
                exhibit2.save(),
                exhibit3.save(),
                exhibit4.save(),
            ]);

            const session = neo.session();

            for (let query of createQueries(
                    res1.body._id,
                    res2.body._id,
                    res3.body._id,
                    exhibit1._id,
                    exhibit2._id,
                    exhibit3._id,
                    exhibit4._id
                )) {
                await session.run(query);
            }

            session.close();
        });

        it("gives not bought recommendations", async function() {
            const res = await requester
                .get(`/api/user/${user1Id}/recommendations/not-bought`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res.body).to.have.length(1);
            expect(res.body[0]).to.have.property("name", "Van Gogh");
        });

        it("gives not bought recommendations", async function() {
            const res = await requester
                .get(`/api/user/${user1Id}/recommendations/visited-by-friends`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res.body).to.have.length(2);
            const names = res.body.map((exhibition) => exhibition.name);
            expect(names).to.have.members(["Picasso", "Rembrandt"]);
        });
    });
});