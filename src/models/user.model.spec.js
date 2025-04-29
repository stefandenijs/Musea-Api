const chai = require("chai");
const expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const User = require("./user.model")();
const Ticket = require("./ticket.model")();
const FriendRequest = require("./friendRequest.model")();

describe("user model", function() {
    describe("unit tests", function() {
        it("should reject an object missing fields", async function() {
            const user = new User({});

            await expect(user.save()).to.be.rejectedWith(Error);
        });

        it("should reject a birthday in the future", async function() {
            const user = new User({
                firstName: "Joe",
                lastName: "Smith",
                email: "Smith@night.com",
                password: "A",
                gender: "Man",
                birthDate: new Date().setFullYear(new Date().getFullYear() + 10),
                role: "general",
            });

            await expect(user.save()).to.be.rejectedWith(Error);
        });

        it("should reject a duplicate email", async function() {
            await new User({
                firstName: "Joe",
                lastName: "Smith",
                email: "Smith@night.com",
                password: "A",
                gender: "Man",
                birthDate: new Date().setFullYear(new Date().getFullYear() - 10),
                role: "general",
            }).save();

            const user = new User({
                firstName: "Joe",
                lastName: "Smith",
                email: "Smith@night.com",
                password: "A",
                gender: "Man",
                birthDate: new Date().setFullYear(new Date().getFullYear() - 10),
                role: "general",
            });

            await expect(user.save()).to.be.rejectedWith(Error);
        });
    });

    it("should delete associated tickets on delete", async function() {
        const user = await new User({
            firstName: "Joe",
            lastName: "Smith",
            email: "Smith@night.com",
            password: "A",
            gender: "Man",
            birthDate: new Date().setFullYear(new Date().getFullYear() - 10),
            role: "general",
        }).save();

        await new Ticket({
            dateOfPurchase: new Date(),
            status: "Afgerond",
            priceAtPurchase: 20,
            exhibition: "61aea7c166437bac9e476472",
            user: user,
        }).save();

        await new Ticket({
            dateOfPurchase: new Date(),
            status: "Afgerond",
            priceAtPurchase: 50,
            exhibition: "61aea7c166437bac9e476472",
            user: user,
        }).save();

        let tickets = await Ticket.find();
        expect(tickets).to.have.length(2);

        await user.delete();

        tickets = await Ticket.find();
        expect(tickets).to.have.length(0);
    });

    it("should delete friend requests on delete", async function() {
        const user = await new User({
            firstName: "Joe",
            lastName: "Smith",
            email: "Smith@night.com",
            password: "A",
            gender: "Man",
            birthDate: new Date().setFullYear(new Date().getFullYear() - 10),
            role: "general",
        }).save();

        const received1 = await new FriendRequest({
            sender: "61aea7c166437bac9e476472",
        }).save();

        const received2 = await new FriendRequest({
            sender: "61aea7c166437bac9e476472",
        }).save();

        await new FriendRequest({
            sender: user,
        }).save();

        await new FriendRequest({
            sender: user,
        }).save();

        user.friendRequests.push(received1);
        user.friendRequests.push(received2);

        await user.save();

        let friendRequests = await FriendRequest.find();
        expect(friendRequests).to.have.length(4);

        await user.delete();

        friendRequests = await FriendRequest.find();
        expect(friendRequests).to.have.length(0);
    });
});