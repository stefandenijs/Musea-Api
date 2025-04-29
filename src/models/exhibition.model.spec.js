const chai = require("chai");
const expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const Exhibition = require("./exhibition.model")();
const Ticket = require("./ticket.model")();

describe("exhibition model", function() {
    describe("unit tests", function() {
        it("should reject a missing name", async function() {
            const exhibition = new Exhibition({});

            await expect(exhibition.save()).to.be.rejectedWith(Error);
        });

        it("should reject a negative price", async function() {
            const exhibition = new Exhibition({
                name: "Something",
                description: "Something",
                theme: "Impressionist",
                price: -23,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            });

            await expect(exhibition.save()).to.be.rejectedWith(Error);
        });

        it("should reject a duplicate name", async function() {
            await new Exhibition({
                name: "Something",
                description: "Something",
                theme: "Impressionist",
                price: 20,
                startDate: "2021-12-05",
                endDate: "2021-12-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const exhibition = new Exhibition({
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

            await expect(exhibition.save()).to.be.rejectedWith(Error);
        });
    });
    it("should delete associated tickets on delete", async function() {
        const exhibition = await new Exhibition({
            name: "Something",
            description: "Something",
            theme: "Impressionist",
            price: 20,
            startDate: "2021-12-05",
            endDate: "2021-12-10",
            dayStartTime: "2021-12-10T09:30:00",
            dayEndTime: "2021-12-05T15:30:00",
            museum: "61aa697c2f108406f7c6df6b",
        }).save();

        await new Ticket({
            dateOfPurchase: new Date(),
            status: "Afgerond",
            priceAtPurchase: 20,
            exhibition: exhibition,
            user: "61aea7c166437bac9e476472",
        }).save();

        await new Ticket({
            dateOfPurchase: new Date(),
            status: "Afgerond",
            priceAtPurchase: 50,
            exhibition: exhibition,
            user: "61aea7c166437bac9e476472",
        }).save();

        let tickets = await Ticket.find();
        expect(tickets).to.have.length(2);

        await exhibition.delete();

        tickets = await Ticket.find();
        expect(tickets).to.have.length(0);
    });
});