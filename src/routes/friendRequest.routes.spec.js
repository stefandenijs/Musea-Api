const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const User = require("../models/user.model")();
const FriendRequest = require("../models/friendRequest.model")();

describe("friendRequest endpoints", function() {
    describe("integration tests", function() {
        it("(POST /api/request/:id) should create a new friendRequest", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Bank",
                email: "Freek@Bank.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res2 = await requester.post("/api/authentication/register").send({
                firstName: "Freeky",
                lastName: "Banky",
                email: "Freeky@Banky.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res3 = await requester
                .post(`/api/request/${res1.body._id.toString()}`)
                .set({ Authorization: `Bearer ${res2.body.token}` })
                .send({
                    senderId: res2.body._id.toString(),
                });

            expect(res3).to.have.status(200);
            expect(res3.body).to.not.equal(undefined);
            expect(res3.body).to.have.property("sender");
        });

        it("(PUT /api/request/:id/accept/:reqId) should accept a friendRequest", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Bank",
                email: "Freek@Bank.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res2 = await requester.post("/api/authentication/register").send({
                firstName: "Freeky",
                lastName: "Banky",
                email: "Freeky@Banky.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res3 = await requester
                .post(`/api/request/${res1.body._id.toString()}`)
                .set({ Authorization: `Bearer ${res2.body.token}` })
                .send({
                    senderId: res2.body._id.toString(),
                });

            expect(res3).to.have.status(200);
            expect(res3.body).to.not.equal(undefined);
            expect(res3.body).to.have.property("sender");

            const res4 = await requester
                .put(`/api/request/${res1.body._id.toString()}/accept/${res3.body._id}`)
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({});

            expect(res4).to.have.status(200);
            const testUser1 = await User.findById(res1.body._id);
            const testUser2 = await User.findById(res2.body._id);
            expect(testUser1.friends).to.not.equal(undefined);
            expect(testUser1.friends).to.have.length(1);
            expect(testUser2.friends).to.not.equal(undefined);
            expect(testUser2.friends).to.have.length(1);
        });

        it("(DELETE /api/request/:id/refuse/:reqId) should refuse a friendRequest", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Bank",
                email: "Freek@Bank.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res2 = await requester.post("/api/authentication/register").send({
                firstName: "Freeky",
                lastName: "Banky",
                email: "Freeky@Banky.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res3 = await requester
                .post(`/api/request/${res1.body._id.toString()}`)
                .set({ Authorization: `Bearer ${res2.body.token}` })
                .send({
                    senderId: res2.body._id.toString(),
                });

            expect(res3).to.have.status(200);
            expect(res3.body).to.not.equal(undefined);
            expect(res3.body).to.have.property("sender");

            const res4 = await requester
                .delete(
                    `/api/request/${res1.body._id.toString()}/refuse/${res3.body._id}`
                )
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({});

            expect(res4).to.have.status(200);

            const friendRequest = await FriendRequest.findById(res3.body._id);

            console.log(friendRequest);

            expect(friendRequest).to.equal(null);
        });

        it("(DELETE /api/request/:id/friend/:friendId) should refuse a friendRequest", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Bank",
                email: "Freek@Bank.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const res2 = await requester.post("/api/authentication/register").send({
                firstName: "Freeky",
                lastName: "Banky",
                email: "Freeky@Banky.nl",
                password: "SuperAdmin",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            let testUser1 = await User.findById(res1.body._id);
            let testUser2 = await User.findById(res2.body._id);

            testUser1.friends.push(testUser2);
            testUser2.friends.push(testUser1);

            await testUser1.save();
            await testUser2.save();

            testUser1 = await User.findById(testUser1._id);
            testUser2 = await User.findById(testUser2._id);

            expect(testUser1.friends).to.have.length(1)
            expect(testUser2.friends).to.have.length(1)

            const res3 = await requester
                .delete(
                    `/api/request/${testUser1._id.toString()}/friend/${testUser2._id.toString()}`
                )
                .set({ Authorization: `Bearer ${res1.body.token}` });

            testUser1 = await User.findById(testUser1._id);
            testUser2 = await User.findById(testUser2._id);

            expect(testUser1.friends).to.have.length(0)
            expect(testUser2.friends).to.have.length(0)
        });
    });
});