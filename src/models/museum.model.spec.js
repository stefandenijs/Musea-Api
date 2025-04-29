const chai = require("chai");
const expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const Museum = require("./museum.model")();
const Exhibition = require("./exhibition.model")();

describe("museum model", function() {
    describe("unit tests", function() {
        it("should reject a missing name", async function() {
            const museum = new Museum({});

            await expect(museum.save()).to.be.rejectedWith(Error);
        });

        it("should reject a wrong postal code", async function() {
            const museum = new Museum({
                name: "Something",
                description: "Something",
                city: "City",
                street: "Street",
                streetNumber: 20,
                postalCode: "213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            });

            await expect(museum.save()).to.be.rejectedWith(Error);
        });

        it("should reject a 0 or negative streetnumber", async function() {
            const museum = new Museum({
                name: "Something",
                description: "Something",
                city: "City",
                street: "Street",
                streetNumber: -3,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            });

            await expect(museum.save()).to.be.rejectedWith(Error);
        });

        it("should reject a duplicate name", async function() {
            await new Museum({
                name: "Something",
                description: "Something",
                city: "City",
                street: "Street",
                streetNumber: 23,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            }).save();

            const museum = new Museum({
                name: "Something",
                description: "Something",
                city: "City",
                street: "Street",
                streetNumber: 23,
                postalCode: "1213 AB",
                phoneNumber: "06-12345678",
                website: "website",
                imgUrl: "imgUrl",
            });

            await expect(museum.save()).to.be.rejectedWith(Error);
        });
    });
    it("should delete associated exhibitions on delete", async function() {
        const museum = await new Museum({
            name: "Museum",
            description: "Museum",
            city: "City",
            street: "Street",
            streetNumber: 20,
            postalCode: "1213 AB",
            phoneNumber: "06-12345678",
            website: "website",
            imgUrl: "imgUrl",
        }).save();

        await new Exhibition({
            name: "Something",
            description: "Something",
            theme: "Impressionist",
            price: 20,
            startDate: "2021-12-05",
            endDate: "2021-12-10",
            dayStartTime: "2021-12-10T09:30:00",
            dayEndTime: "2021-12-05T15:30:00",
            museum: museum,
        }).save();

        await new Exhibition({
            name: "SomethingElse",
            description: "SomethingElse",
            theme: "Impressionist",
            price: 20,
            startDate: "2021-12-05",
            endDate: "2021-12-10",
            dayStartTime: "2021-12-10T09:30:00",
            dayEndTime: "2021-12-05T15:30:00",
            museum: museum,
        }).save();

        let exhibitions = await Exhibition.find();
        expect(exhibitions).to.have.length(2);

        await museum.delete();

        exhibitions = await Exhibition.find();
        expect(exhibitions).to.have.length(0);
    });
});