const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const User = require("../models/user.model")();

let token;

let otherToken;

describe("user endpoints", function() {
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
        it("(POST /api/user) should create a new user", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    firstName: "Freek",
                    lastName: "Vonk",
                    email: "Freek@Vonk.nl",
                    password: "super",
                    gender: "Man",
                    birthDate: "1983-02-24",
                    role: "general",
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property("_id");

            const user = await User.findOne({ name: "Freek" });
        });

        it("(POST /api/user) should not create a user with a missing field", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    lastName: "Vonk",
                    email: "Freek@Vonk.nl",
                    password: "super",
                    gender: "Man",
                    birthDate: "1983-02-24",
                    role: "general",
                });

            expect(res).to.have.status(400);

            const docCount = await User.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(POST /api/user) should not create a user with a birth date in the future", async function() {
            const res = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send({
                    lastName: "Vonk",
                    email: "Freek@Vonk.nl",
                    password: "super",
                    gender: "Man",
                    birthDate: new Date().setFullYear(new Date().getFullYear + 10),
                    role: "general",
                });

            expect(res).to.have.status(400);

            const docCount = await User.find().countDocuments();
            expect(docCount).to.equal(0);
        });

        it("(GET /api/user) should give all users", async function() {
            const testNameA = "Freek";
            const testNameB = "Freeky";

            await new User({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            }).save();
            await new User({
                firstName: "Freeky",
                lastName: "Vonka",
                email: "Freek@Vonka.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            }).save();

            const res = await requester.get("/api/user");

            expect(res).to.have.status(200);
            const users = res.body;
            expect(users).to.have.length(2);
            expect(users[0]).to.have.property("firstName", testNameA);
            expect(users[1]).to.have.property("firstName", testNameB);
        });

        it("(GET /api/user/:id) should give a user", async function() {
            const testUser = new User({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            await testUser.save();

            const res = await requester.get(`/api/user/${testUser.id}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("firstName", testUser.firstName);
        });

        it("(PUT /api/user/:id) should give a user", async function() {
            const testUser = await new User({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            }).save();

            const res = await requester
                .put(`/api/user/${testUser.id}`)
                .set({ Authorization: `Bearer ${token}` })
                .send({ firstName: "Mark" });

            expect(res).to.have.status(204);

            const res2 = await requester.get(`/api/user/${testUser.id}`);
            expect(res2).to.have.status(200);
            expect(res2.body.firstName).to.equal("Mark");
        });

        it("(DELETE /api/user/:id) should delete a user", async function() {
            const testUser = new User({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            await testUser.save();

            const res = await requester
                .delete(`/api/user/${testUser.id}`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res).to.have.status(204);

            const user = await User.findOne({ firstName: testUser.firstName });
            expect(user).to.be.null;

            const docCount = await User.find().countDocuments();
            expect(docCount).to.equal(0);
        });
    });

    describe("system tests", function() {
        it("should create two users and retrieve a list of users", async function() {
            const testUserA = {
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            };
            const testUserB = {
                firstName: "Freeky",
                lastName: "Vonka",
                email: "Freek@Vonka.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            };

            const res1 = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send(testUserA);
            expect(res1).to.have.status(201);
            expect(res1.body).to.have.property("_id");
            testUserA._id = res1.body._id;
            const res2 = await requester
                .post("/api/user")
                .set({ Authorization: `Bearer ${token}` })
                .send(testUserB);
            expect(res2).to.have.status(201);
            expect(res2.body).to.have.property("_id");
            testUserB._id = res2.body._id;

            const res3 = await requester.get("/api/user");
            expect(res3).to.have.status(200);
            expect(res3.body).to.have.length(2);

            for (let user of res3.body) {
                let referenceUser;

                if (user._id === testUserA._id) {
                    referenceUser = testUserA;
                } else if (user._id === testUserB._id) {
                    referenceUser = testUserB;
                } else {
                    throw new Error("User id is invalid");
                }

                expect(user._id).to.equal(referenceUser._id);
                expect(user.firstName).to.equal(referenceUser.firstName);
            }
        });

        it("non admin user should not be able to change another user", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freeky",
                lastName: "Vonka",
                email: "Freek@Vonka.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });
            otherToken = res1;

            const testUser = await new User({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            }).save();

            const res2 = await requester
                .put(`/api/user/${testUser.id}`)
                .set({ Authorization: `Bearer ${otherToken}` })
                .send({});

            expect(res2).to.have.status(401);
            expect(res2.body.message).to.equal("User is not authorized");
        });
    });
});