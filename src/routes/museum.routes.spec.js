const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const Museum = require("../models/museum.model")();

let token;

describe("museum endpoints", function() {
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
        it("(POST /api/museum) should create a new museum", async function() {
            const res = await requester
                .post("/api/museum")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Something",
                    description: "Something",
                    city: "City",
                    street: "Street",
                    streetNumber: 20,
                    postalCode: "1213 AB",
                    phoneNumber: "06-12345678",
                    website: "website",
                    imgUrl: "imgUrl",
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property("_id");
            expect(res.body).to.have.property("name");
            expect(res.body).to.have.property("city");
        });

        it("(POST /api/museum) should not create a museum with a missing field", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Something",
                    description: "Something",
                    city: "City",
                    street: "Street",
                    streetNumber: 20,
                    postalCode: "1213 AB",
                    phoneNumber: "06-12345678",
                    website: "website",
                    imgUrl: "imgUrl",
                });

            expect(res).to.have.status(400);

            const docCount = await Museum.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(POST /api/museum) should not create a museum with a negative or 0 street number", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Something",
                    description: "Something",
                    city: "City",
                    street: "Street",
                    streetNumber: -2,
                    postalCode: "1213 AB",
                    phoneNumber: "06-12345678",
                    website: "website",
                    imgUrl: "imgUrl",
                });

            expect(res).to.have.status(400);

            const docCount = await Museum.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(POST /api/museum) should not create a museum with an invalid postal code", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    name: "Something",
                    description: "Something",
                    city: "City",
                    street: "Street",
                    streetNumber: 20,
                    postalCode: "12 AB",
                    phoneNumber: "06-12345678",
                    website: "website",
                    imgUrl: "imgUrl",
                });

            expect(res).to.have.status(400);

            const docCount = await Museum.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(GET /api/museum) should give all museums", async function() {
            const testNameA = "Rijksmuseum";
            const testNameB = "De Pont";

            await new Museum({
                name: "Rijksmuseum",
                description: "Rijksmuseum",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            }).save();
            await new Museum({
                name: "De Pont",
                description: "De Pont",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            }).save();

            const res = await requester.get("/api/museum");

            expect(res).to.have.status(200);
            const museums = res.body;
            expect(museums).to.have.length(2);
            expect(museums[0]).to.have.property("name", testNameA);
            expect(museums[1]).to.have.property("name", testNameB);
        });

        it("(GET /api/museum/:id) should give a museum", async function() {
            const testMuseum = new Museum({
                name: "Rijksmuseum",
                description: "Rijksmuseum",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            });

            await testMuseum.save();

            const res = await requester.get(`/api/museum/${testMuseum.id}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("name", testMuseum.name);
            expect(res.body).to.have.property("description", testMuseum.description);
            expect(res.body).to.have.property("website", testMuseum.website);
        });

        it("(PUT /api/museum/:id) should change a museum", async function() {
            const testMuseum = await new Museum({
                name: "Rijksmuseum",
                description: "Rijksmuseum",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            }).save();

            const res = await requester
                .put(`/api/museum/${testMuseum.id}`)
                .set({ Authorization: `Bearer ${token}` })
                .send({ name: "De Pont" });

            expect(res).to.have.status(204);

            const res2 = await requester.get(`/api/museum/${testMuseum.id}`);
            expect(res2).to.have.status(200);
            expect(res2.body.name).to.equal("De Pont");
        });

        it("(DELETE /api/museum/:id) should delete a museum", async function() {
            const testMuseum = new Museum({
                name: "Rijksmuseum",
                description: "Rijksmuseum",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            });

            await testMuseum.save();

            const res = await requester
                .delete(`/api/museum/${testMuseum.id}`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res).to.have.status(204);

            const museum = await Museum.findOne({ name: testMuseum.name });
            expect(museum).to.be.null;

            const docCount = await Museum.find().countDocuments();
            expect(docCount).to.equal(0);
        });
    });
    describe("system tests", function() {
        it("should create two museums and retrieve a list of museums", async function() {
            const testMuseumA = {
                name: "Rijksmuseum",
                description: "Rijksmuseum",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            };
            const testMuseumB = {
                name: "De Pont",
                description: "De Pont",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            };

            const res1 = await requester
                .post("/api/museum")
                .set({ Authorization: `Bearer ${token}` })
                .send(testMuseumA);
            expect(res1).to.have.status(201);
            expect(res1.body).to.have.property("_id");
            testMuseumA._id = res1.body._id;
            const res2 = await requester
                .post("/api/museum")
                .set({ Authorization: `Bearer ${token}` })
                .send(testMuseumB);
            expect(res2).to.have.status(201);
            expect(res2.body).to.have.property("_id");
            testMuseumB._id = res2.body._id;

            const res3 = await requester.get("/api/museum");
            expect(res3).to.have.status(200);
            expect(res3.body).to.have.length(2);

            for (let museum of res3.body) {
                let referenceUser;

                if (museum._id === testMuseumA._id) {
                    referenceUser = testMuseumA;
                } else if (museum._id === testMuseumB._id) {
                    referenceUser = testMuseumB;
                } else {
                    throw new Error("User id is invalid");
                }

                expect(museum._id).to.equal(referenceUser._id);
                expect(museum.firstName).to.equal(referenceUser.firstName);
            }
        });
    });
});