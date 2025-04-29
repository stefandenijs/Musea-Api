const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const User = require("../models/user.model")();

require("./user.routes.spec");

let token;

describe("profile endpoints", function() {
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
        it("(GET /api/profile) should retrieve logged in user", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });
            expect(res1).to.have.status(200);

            const res2 = await requester
                .get("/api/profile")
                .set({ Authorization: `Bearer ${res1.body.token}` });

            expect(res2).to.have.status(200);
            expect(res2.body).to.not.equal(null);
            expect(res2.body).to.have.property("firstName", "Freek");
            expect(res2.body).to.have.property("lastName", "Vonk");
            expect(res2.body).to.have.property("email", "Freek@Vonk.nl");
        });

        it("(PUT /api/profile/:id) should allow non-admin user to update themselves", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });
            expect(res1).to.have.status(200);

            const res2 = await requester
                .put(`/api/profile/${res1.body._id}`)
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({ firstName: "David" });

            expect(res2).to.have.status(204);
            const user = await User.findById(res1.body._id);
            expect(user).to.have.property("firstName", user.firstName)
        });

        it("(PUT /api/profile/:id) other users cannot change other users profiles", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });
            expect(res1).to.have.status(200);

            const res2 = await requester
                .put(`/api/profile/${res1.body._id}`)
                .set({ Authorization: `Bearer ${token}` })
                .send({ firstName: "David" });

            expect(res2).to.have.status(401);
            const user = await User.findById(res1.body._id);
            expect(user).to.have.property("firstName", "Freek")
        });
    });
});