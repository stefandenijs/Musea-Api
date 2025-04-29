const chai = require("chai");
const expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const Ticket = require("./ticket.model")();

describe("ticket model", function() {
    describe("unit tests", function() {
        it("should reject a missing status", async function() {
            const ticket = new Ticket({});

            await expect(ticket.save()).to.be.rejectedWith(Error);
        });

        it("should reject a missing price at purchase", async function() {
            const ticket = new Ticket({
                status: "Afgerond"
            });

            await expect(ticket.save()).to.be.rejectedWith(Error);
        });

        it("should reject a missing exhibition", async function() {
            const ticket = new Ticket({
                status: "Afgerond",
                priceAtPurchase: 20
            });

            await expect(ticket.save()).to.be.rejectedWith(Error);
        });

        it("should reject a missing exhibition", async function() {
            const ticket = new Ticket({
                status: "Afgerond",
                priceAtPurchase: 20,
                exhibition: "",
                user: "61aea7c166437bac9e476472"
            });

            await expect(ticket.save()).to.be.rejectedWith(Error);
        });

        it("should reject a missing user", async function() {
            const ticket = new Ticket({
                dateOfPurchase: new Date(),
                status: "Afgerond",
                priceAtPurchase: 20,
                exhibition: "61aea7c166437bac9e476472",
                user: ""
            });

            await expect(ticket.save()).to.be.rejectedWith(Error);
        });
    });
});