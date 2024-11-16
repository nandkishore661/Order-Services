// test/order.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const assert = require("assert");
const jwt = require("jsonwebtoken");

// Connect to a test database before tests
before(async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close the database connection after tests
after(async () => {
  await mongoose.connection.close();
});

// Mock JWT token
const mockToken = (userId = "6736db2b67909bf7fe940230", role = "customer") => {
  return jwt.sign({ userId, role }, "your_secret_key", { expiresIn: "1h" });
};

describe("Order API", () => {
  let orderId;

  it("should place a new order", async () => {
    const res = await request(app)
      .post("/order")
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "customer")}`
      )
      .send({
        customer_id: "6736df41898d7a52166f9f11",
        restaurant_id: "6736f9d60100ea5d21a8427b",
        total_amount: 30,
        items: [{ menu_item_id: "productId1", quantity: 2, price: 15 }],
      });

    assert.equal(res.status, 201);
    assert.ok(res.body._id); // Check that _id exists
    orderId = res.body._id; // Save the order ID for later tests
  });

  it("should get an order by ID", async () => {
    const res = await request(app)
      .get(`/order/${orderId}`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "customer")}`
      );

    assert.equal(res.status, 200);
    assert.equal(res.body._id, orderId); // Check that the retrieved order has the correct ID
  });

  it("should update an order status", async () => {
    const res = await request(app)
      .put(`/order/${orderId}/status`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "restaurant_owner")}`
      )
      .send({ status: "completed" });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "completed"); // Check that the status was updated
  });

  it("should return 403 for delivery_personnel trying to update order status", async () => {
    const res = await request(app)
      .put(`/order/${orderId}/status`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "delivery_personnel")}`
      )
      .send({ status: "completed" });

    assert.equal(res.status, 403); // Check that access is denied
    assert.equal(res.body.message, "Access denied"); // Check the access denied message
  });

  it("should get all orders for a customer", async () => {
    const res = await request(app)
      .get(`/order/customers/6736db2b67909bf7fe940230`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "customer")}`
      );

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body)); // Check that the response is an array
  });

  it("should return 403 for restaurant_owner trying to get all orders", async () => {
    const res = await request(app)
      .get(`/order/customers/6736db2b67909bf7fe940230`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "restaurant_owner")}`
      );

    assert.equal(res.status, 403); // Check that access is denied
    assert.equal(res.body.message, "Access denied"); // Check the access denied message
  });

  it("should return 404 for non-existing order", async () => {
    const res = await request(app)
      .get(`/order/6736f9f153c8c36cfdc25de5`)
      .set(
        "Authorization",
        `Bearer ${mockToken("6736db2b67909bf7fe940230", "customer")}`
      );

    assert.equal(res.status, 404);
    assert.equal(res.body.message, "Order not found"); // Check the not found message
  });

    it("should get a list of available deliveries", async () => {
      const res = await request(app)
        .get("/delivery")
        .set(
          "Authorization",
          `Bearer ${mockToken(
            "6736db2b67909bf7fe940230",
            "delivery_personnel"
          )}`
        );

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body)); // Check that the response is an array
    });

    it("should return 404 if delivery not found", async () => {
      const res = await request(app)
        .post(`/delivery/${orderId}`) // Assuming 999 is a non-existent delivery ID
        .set(
          "Authorization",
          `Bearer ${mockToken(
            "67377289d4eacc7e98dbb939",
            "delivery_personnel"
          )}`
        )
        .send({
          delivery_personnel_id: "67377289d4eacc7e98dbb939",
          status: "en route",
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.message, "Delivery not found or already accepted");
    });

    it("should return 403 if user does not have access", async () => {
      const res = await request(app)
        .post(`/delivery/${orderId}`)
        .set(
          "Authorization",
          `Bearer ${mockToken("67377289d4eacc7e98dbb939", "customer")}`
        ) // Using customer role
        .send({
          delivery_personnel_id: "67377289d4eacc7e98dbb939",
          status: "delivered",
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.message, "Access denied");
    });

    it("should return 404 for non-existing delivery status update", async () => {
      const res = await request(app)
        .put(`/delivery/673773b3783410e7350b3ec7`) // Assuming 999 is a non-existent delivery ID
        .set(
          "Authorization",
          `Bearer ${mockToken(
            "67377289d4eacc7e98dbb939",
            "delivery_personnel"
          )}`
        )
        .send({ status: "completed" });

      assert.equal(res.status, 404);
    });
});
