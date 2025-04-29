const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const Exhibition = require("../models/exhibition.model")();

let token;

describe("exhibition endpoints", function() {
    this.beforeAll(async function() {
        const res = await requester.post("/api/authentication/register").send({
            firstName: "Admin",
            lastName: "User",
            email: "Admin@User.nl",
            password: "SuperAdmin",
            gender: "Man",
            birthDate: "1983-02-24",
            role: "admin",
        });
        token = res.body.token;
    });

    describe("integration tests", function() {
        it("(POST /api/exhibition) should create a new exhibition", async function() {
            const res = await requester
                .post("/api/exhibition")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Something",
                    description: "Something",
                    theme: "Impressionist",
                    price: 20,
                    startDate: "2021-12-05",
                    endDate: "2021-12-10",
                    dayStartTime: "2021-12-10T09:30:00",
                    dayEndTime: "2021-12-05T15:30:00",
                    museum: "61aa697c2f108406f7c6df6b",
                });
            expect(res).to.have.status(201);
            expect(res.body).to.have.property("_id");
        });

        it("(POST /api/exhibition) should not create a exhibition with a missing field", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    description: "Something",
                    theme: "Impressionist",
                    price: 20,
                    startDate: "2021-12-05",
                    endDate: "2021-12-10",
                    dayStartTime: "2021-12-10T09:30:00",
                    dayEndTime: "2021-12-05T15:30:00",
                    museum: "61aa697c2f108406f7c6df6b",
                });

            expect(res).to.have.status(400);

            const docCount = await Exhibition.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(POST /api/exhibition) should not create a exhibition with a negative price", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Picasso",
                    description: "Something",
                    theme: "Impressionist",
                    price: -20,
                    startDate: "2021-12-05",
                    endDate: "2021-12-10",
                    dayStartTime: "2021-12-10T09:30:00",
                    dayEndTime: "2021-12-05T15:30:00",
                    museum: "61aa697c2f108406f7c6df6b",
                });

            expect(res).to.have.status(400);

            const docCount = await Exhibition.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(POST /api/exhibition) should not create a exhibition with a missing museum", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Picasso",
                    description: "Something",
                    theme: "Impressionist",
                    price: 20,
                    startDate: "2021-12-05",
                    endDate: "2021-12-10",
                    dayStartTime: "2021-12-10T09:30:00",
                    dayEndTime: "2021-12-05T15:30:00",
                    museum: "",
                });

            expect(res).to.have.status(400);

            const docCount = await Exhibition.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(GET /api/exhibition) should give all exhibitions", async function() {
            const testNameA = "Picasso";
            const testNameB = "Rembrandt";

            await new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();
            await new Exhibition({
                name: "Rembrandt",
                description: "Rembrandt",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const res = await requester.get("/api/exhibition");

            expect(res).to.have.status(200);
            const exhibitions = res.body;
            expect(exhibitions).to.have.length(2);
            expect(exhibitions[0]).to.have.property("name", testNameA);
            expect(exhibitions[1]).to.have.property("name", testNameB);
        });

        it("(GET /api/exhibition/:id) should give a exhibition", async function() {
            const testExhibition = new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });

            await testExhibition.save();

            const res = await requester.get(`/api/exhibition/${testExhibition.id}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("name", testExhibition.name);
        });

        it("(PUT /api/exhibition/:id) should change a exhibition", async function() {
            const testExhibition = await Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const res = await requester
                .put(`/api/exhibition/${testExhibition.id}`)
                .set({ Authorization: `Bearer ${token}` })
                .send({ name: "Rembrandt" });

            expect(res).to.have.status(204);

            const res2 = await requester.get(`/api/exhibition/${testExhibition.id}`);
            expect(res2).to.have.status(200);
            expect(res2.body.name).to.equal("Rembrandt");
        });

        it("(DELETE /api/exhibition/:id) should delete a exhibition", async function() {
            const testExhibition = new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });

            await testExhibition.save();

            const res = await requester
                .delete(`/api/exhibition/${testExhibition.id}`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res).to.have.status(204);

            const exhibition = await Exhibition.findOne({
                name: testExhibition.name,
            });
            expect(exhibition).to.be.null;

            const docCount = await Exhibition.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(GET /api/exhibition/recent) should give all exhibitions sorted on startDate", async function() {
            const testNameA = "Picasso";
            const testNameB = "Rembrandt";

            await new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();
            await new Exhibition({
                name: "Rembrandt",
                description: "Rembrandt",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-20",
                endDate: "2022-01-30",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const res = await requester.get("/api/exhibition");

            expect(res).to.have.status(200);
            const exhibitions = res.body;
            exhibitions.sort((a, b) => new Date(a.startDate) < new Date(b.startDate));
            expect(exhibitions).to.have.length(2);
            expect(exhibitions[0]).to.have.property("name", testNameA);
            expect(exhibitions[1]).to.have.property("name", testNameB);
        });
    });
});