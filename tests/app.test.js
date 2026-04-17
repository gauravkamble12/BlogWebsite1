const request = require("supertest");
const mongoose = require("mongoose");

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_test";
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Blog API Tests", () => {
  let app;
  let server;
  let userId;
  let blogId;
  let token;
  let cookie;

  beforeAll(async () => {
    jest.resetModules();
    app = require("../index.js");
  });

  afterAll(async () => {
    // No need to close server as it's handled by supertest
  });

  describe("POST /api/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({
          name: "Test User",
          email: "test" + Date.now() + "@example.com",
          password: "password123",
          profession: "Developer"
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("name", "Test User");
    });
  });

  describe("POST /api/login", () => {
    it("should login existing user", async () => {
      const email = "test" + Date.now() + "@example.com";
      
      await request(app)
        .post("/api/register")
        .send({
          name: "Test User",
          email: email,
          password: "password123",
          profession: "Developer"
        });

      const res = await request(app)
        .post("/api/login")
        .send({
          email: email,
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword"
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET / (Home Page)", () => {
    it("should render home page with blogs", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.text).toContain("bento-card");
    });
  });

  describe("GET /login", () => {
    it("should render login page", async () => {
      const res = await request(app).get("/login");
      expect(res.status).toBe(200);
      expect(res.text).toContain("login");
    });
  });

  describe("GET /register", () => {
    it("should render register page", async () => {
      const res = await request(app).get("/register");
      expect(res.status).toBe(200);
      expect(res.text).toContain("register");
    });
  });
});

describe("Validation Tests", () => {
  const { registerValidation, loginValidation, blogValidation } = require("../middleware/validation");

  describe("registerValidation", () => {
    it("should fail on empty name", async () => {
      const req = { body: { name: "", email: "test@example.com", password: "123456" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registerValidation[2](req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should fail on invalid email", async () => {
      const req = { body: { name: "Test", email: "invalid", password: "123456" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registerValidation[1](req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should fail on short password", async () => {
      const req = { body: { name: "Test", email: "test@example.com", password: "123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registerValidation[3](req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("blogValidation", () => {
    it("should fail on empty title", async () => {
      const req = { body: { title: "", content: "Some content" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await blogValidation[0](req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should fail on short content", async () => {
      const req = { body: { title: "Test Title", content: "Short" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await blogValidation[1](req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
