const mongoose = require("mongoose");
require("dotenv").config();
const { loginUser, loginHR } = require("./controllers/authController");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clean up if the test user exists
    const testEmail = "testlogin_verify@example.com";
    await User.deleteMany({ email: testEmail });

    // Create a candidate (User) to test against
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    await User.create({
      firstName: "Test",
      lastName: "User",
      name: "Test User",
      email: testEmail,
      password: hashedPassword,
      passwordSet: true,
      role: "user"
    });
    console.log("Created test candidate user:", testEmail);

    // Test case 1: Email is candidate email (User), login on HR page (loginHR) with WRONG password
    console.log("\n--- Running Test Case 1: Candidate email, HR Login page, WRONG password ---");
    let res1Status, res1Data;
    const req1 = {
      body: {
        email: testEmail,
        password: "wrongpassword123"
      }
    };
    const res1 = {
      status: function(code) {
        res1Status = code;
        return this;
      },
      json: function(data) {
        res1Data = data;
        return this;
      }
    };
    await loginHR(req1, res1);
    console.log("Response Status (Expected: 400):", res1Status);
    console.log("Response Data (Expected: { message: 'Incorrect password' }):", res1Data);

    // Test case 2: Email is candidate email (User), login on HR page (loginHR) with CORRECT password
    console.log("\n--- Running Test Case 2: Candidate email, HR Login page, CORRECT password ---");
    let res2Status, res2Data;
    const req2 = {
      body: {
        email: testEmail,
        password: "Password123!"
      }
    };
    const res2 = {
      status: function(code) {
        res2Status = code;
        return this;
      },
      json: function(data) {
        res2Data = data;
        return this;
      }
    };
    await loginHR(req2, res2);
    console.log("Response Status (Expected: 400):", res2Status);
    console.log("Response Data (Expected: registered as job seeker message):", res2Data);

    // Test case 3: Email is candidate email (User), login on Candidate page (loginUser) with CORRECT password
    console.log("\n--- Running Test Case 3: Candidate email, Candidate Login page, CORRECT password ---");
    let res3Status, res3Data;
    const req3 = {
      body: {
        email: testEmail,
        password: "Password123!"
      }
    };
    const res3 = {
      status: function(code) {
        res3Status = code;
        return this;
      },
      json: function(data) {
        res3Data = data;
        return this;
      }
    };
    await loginUser(req3, res3);
    console.log("Response Status (Expected: 200):", res3Status);
    console.log("Response Data (Expected: token & user info):", res3Data ? { ...res3Data, token: res3Data.token ? "PRESENT" : "MISSING" } : null);

    // Test case 4: Non-existent email
    console.log("\n--- Running Test Case 4: Non-existent email ---");
    let res4Status, res4Data;
    const req4 = {
      body: {
        email: "doesnotexist@example.com",
        password: "anypassword"
      }
    };
    const res4 = {
      status: function(code) {
        res4Status = code;
        return this;
      },
      json: function(data) {
        res4Data = data;
        return this;
      }
    };
    await loginHR(req4, res4);
    console.log("Response Status (Expected: 400):", res4Status);
    console.log("Response Data (Expected: { message: 'No account found. Please register first.' }):", res4Data);

    // Clean up test database entries
    await User.deleteMany({ email: testEmail });
    console.log("\nCleaned up test candidate user.");

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

runTests();
