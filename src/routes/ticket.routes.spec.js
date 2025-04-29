const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");

const User = require("../models/user.model")();
const Exhibition = require("../models/exhibition.model")();
const Ticket = require("../models/ticket.model")();

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
        it("(POST /api/ticket) should create a new ticket", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const testExhibition = await new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const res2 = await requester
                .post("/api/ticket")
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({
                    exhibition: testExhibition._id.toString(),
                    user: res1.body._id,
                    status: "Afgerond",
                    priceAtPurchase: 20,
                });

            expect(res2).to.have.status(201);
            expect(res2.body).to.have.property("_id");

            const ticket = await Ticket.findById(res2.body._id);

            expect(ticket).to.have.property("exhibition");
            expect(ticket).to.have.property("user");
            expect(ticket).to.have.property("status");
            expect(ticket).to.have.property("priceAtPurchase");
        });

        it("(PUT /api/ticket/:id) should update a ticket", async function() {
            const res1 = await requester.post("/api/authentication/register").send({
                firstName: "Freek",
                lastName: "Vonk",
                email: "Freek@Vonk.nl",
                password: "super",
                gender: "Man",
                birthDate: "1983-02-24",
                role: "general",
            });

            const testExhibition = await new Exhibition({
                name: "Picasso",
                description: "Picasso",
                theme: "Impressionist",
                price: 20,
                startDate: "2022-01-05",
                endDate: "2022-01-10",
                dayStartTime: "2021-12-10T09:30:00",
                dayEndTime: "2021-12-05T15:30:00",
                museum: "61aa697c2f108406f7c6df6b",
            }).save();

            const res2 = await requester
                .post("/api/ticket")
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({
                    exhibition: testExhibition._id.toString(),
                    user: res1.body._id,
                    status: "Afgerond",
                    priceAtPurchase: 20,
                });

            expect(res2).to.have.status(201);
            expect(res2.body).to.have.property("_id");

            let ticket = await Ticket.findById(res2.body._id);

            expect(ticket).to.have.property("exhibition");
            expect(ticket).to.have.property("user");
            expect(ticket).to.have.property("status");
            expect(ticket).to.have.property("priceAtPurchase");

            const res3 = await requester
                .put(`/api/ticket/${ticket._id.toString()}`)
                .set({ Authorization: `Bearer ${res1.body.token}` })
                .send({
                    status: "Geannuleerd",
                });

            expect(res3).to.have.status(204);

            ticket = await Ticket.findById(res2.body._id);
            expect(ticket).to.have.property("status", "Geannuleerd");
        });

        it("(GET /api/ticket) should get a list of tickets", async function() {
            const ticket1 = new Ticket({
                dateOfPurchase: new Date(),
                status: "Afgerond",
                priceAtPurchase: 20,
                exhibition: "61aea7c166437bac9e476472",
                user: "61aea7c166437bac9e476472",
            }).save();

            const ticket2 = new Ticket({
                dateOfPurchase: new Date(),
                status: "Afgerond",
                priceAtPurchase: 40,
                exhibition: "61bba7c166437bac9e476472",
                user: "61bba7c166437bac9e476472",
            }).save();

            const res = await requester
                .get("/api/ticket")
                .set({ Authorization: `Bearer ${token}` });

            expect(res).to.have.status(200);
            const tickets = res.body;
            expect(tickets).to.have.length(2);
            expect(tickets[0]).to.have.property("status", "Afgerond");
            expect(tickets[1]).to.have.property("status", "Afgerond");
        });

        it("(GET /api/ticket/:id) should get a single ticket", async function() {
            const ticket = await new Ticket({
                dateOfPurchase: new Date(),
                status: "Afgerond",
                priceAtPurchase: 20,
                exhibition: "61aea7c166437bac9e476472",
                user: "61aea7c166437bac9e476472",
            }).save();

            const res = await requester
                .get(`/api/ticket/${ticket._id.toString()}`)
                .set({ Authorization: `Bearer ${token}` });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("status");
            expect(res.body).to.have.property("exhibition");
            expect(res.body).to.have.property("user");
            expect(res.body).to.have.property("priceAtPurchase");
        });
    });
});