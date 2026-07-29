require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const customerRoutes = require(
    "./routes/customerRoutes"
);
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use(
    "/api/customers",
    customerRoutes
);

app.get("/", (req, res) => {
  res.send("🚀 Order Dashboard API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const createAdmin = async () => {

    try{

        const admin = await User.findOne({
            username:"shivalik"
        });

        if(admin){

            console.log("Admin already exists");

            return;

        }

        const hashedPassword = await bcrypt.hash("dragonfarm",10);

        await User.create({

            username:"shivalik",

            password:hashedPassword,

            role:"admin"

        });

        console.log("Default Admin Created");

    }

    catch(err){

        console.log(err);

    }

};

createAdmin();