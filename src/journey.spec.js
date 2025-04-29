const chai = require("chai");
const expect = chai.expect;

const requester = require("../requester.spec");

describe("user journeys", function() {
    it("create user; create museum; create exhibition; buy ticket", async function() {
        let res;
        let token;

        res = await requester.post("/api/authentication/register").send({
            firstName: "Admin",
            lastName: "User",
            email: "Admin@User.nl",
            password: "SuperAdmin",
            gender: "Man",
            birthDate: "1983-02-24",
            role: "admin",
        });

        expect(res).to.have.status(200);
        token = res.body.token;
        const userId = res.body._id;

        const museum = {
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

        res = await requester
            .post("/api/museum")
            .set({ Authorization: `Bearer ${token}` })
            .send(museum);

        expect(res).to.have.status(201);
        const museumId = res.body._id;

        const exhibition = {
            name: "Picasso",
            description: "Picasso",
            theme: "Impressionist",
            price: 20,
            startDate: "2022-01-05",
            endDate: "2022-01-10",
            dayStartTime: "2021-12-10T09:30:00",
            dayEndTime: "2021-12-05T15:30:00",
            museum: museumId,
        };

        res = await requester
            .post("/api/exhibition")
            .set({ Authorization: `Bearer ${token}` })
            .send(exhibition);

        expect(res).to.have.status(201);
        const exhibitionId = res.body._id;

        const ticket = {
            status: "Afgerond",
            priceAtPurchase: 20,
            exhibition: exhibitionId,
            user: userId,
        };

        res = await requester
            .post("/api/ticket")
            .set({ Authorization: `Bearer ${token}` })
            .send(ticket);

        expect(res).to.have.status(201);
        const ticketId = res.body._id;

        res = await requester
            .get(`/api/ticket/${ticketId}`)
            .set({ Authorization: `Bearer ${token}` });

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("user", userId);
        expect(res.body)
            .to.have.property("exhibition")
            .to.have.property("_id", exhibitionId);
    });
});