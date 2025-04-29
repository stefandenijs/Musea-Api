const chai = require("chai");
const expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const FriendRequest = require("./friendRequest.model")();

describe("user model", function() {
    describe("unit tests", function() {
        it("should reject a missing sender", async function() {
            const friendRequest = new FriendRequest({
                sender: "",
            });

            await expect(friendRequest.save()).to.be.rejectedWith(Error);
        });
    });
});