const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

describe("authentication endpoints", function() {
    it("register should return a token", async function() {
        const res = await requester.post("/api/authentication/register").send({
            firstName: "Freek",
            lastName: "Vonk",
            email: "Freek@Vonk.nl",
            password: "super",
            gender: "Man",
            birthDate: "1983-02-24",
            role: "general",
        });

        expect(res).to.have.status(200)
        expect(res.body).to.have.property("token")
    })

    it("login should return a token", async function() {
        const res = await requester.post("/api/authentication/register").send({
            firstName: "Freek",
            lastName: "Vonk",
            email: "Freek@Vonk.nl",
            password: "super",
            gender: "Man",
            birthDate: "1983-02-24",
            role: "general",
        });

        expect(res).to.have.status(200)
        expect(res.body).to.have.property("token")

        const res2 = await requester.post("/api/authentication/login").send({
            email: "Freek@Vonk.nl",
            password: "super"
        })

        expect(res2).to.have.status(200)
        expect(res2.body).to.have.property("token")
    })
})