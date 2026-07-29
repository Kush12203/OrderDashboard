const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
            });
        }

        const normalizedUsername = username
            .trim()
            .toLowerCase();

        const user = await User.findOne({
            username: normalizedUsername
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                message:
                    "Your account is inactive. Contact the administrator."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            token,

            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                isActive: user.isActive !== false
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};