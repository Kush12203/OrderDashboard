const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        const {
            username,
            password,
            role = "user"
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message:
                    "Username and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });
        }

        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({
                message: "Invalid user role."
            });
        }

        const normalizedUsername = username
            .trim()
            .toLowerCase();

        const existingUser = await User.findOne({
            username: normalizedUsername
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            username: normalizedUsername,
            password: hashedPassword,
            role,
            isActive: true
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};

// Update role or active status
exports.updateUser = async (req, res) => {
    try {
        const { role, isActive } = req.body;

        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const isCurrentUser =
            user._id.toString() ===
            req.user._id.toString();

        if (
            isCurrentUser &&
            isActive === false
        ) {
            return res.status(400).json({
                message:
                    "You cannot deactivate your own account."
            });
        }

        if (
            isCurrentUser &&
            role &&
            role !== "admin"
        ) {
            return res.status(400).json({
                message:
                    "You cannot remove your own admin role."
            });
        }

        if (
            role !== undefined &&
            !["admin", "user"].includes(role)
        ) {
            return res.status(400).json({
                message: "Invalid user role."
            });
        }

        if (role !== undefined) {
            user.role = role;
        }

        if (isActive !== undefined) {
            user.isActive = Boolean(isActive);
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });
        }

        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        user.password = await bcrypt.hash(
            password,
            10
        );

        await user.save();

        res.status(200).json({
            message: "Password reset successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (
            user._id.toString() ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot delete your own account."
            });
        }

        await user.deleteOne();

        res.status(200).json({
            message: "User deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};