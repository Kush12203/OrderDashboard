const express = require("express");

const router = express.Router();

const userController = require(
    "../controllers/userController"
);

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

router.use(protect);
router.use(adminOnly);

router
    .route("/")
    .get(userController.getUsers)
    .post(userController.createUser);

router
    .route("/:id")
    .put(userController.updateUser)
    .delete(userController.deleteUser);

router.put(
    "/:id/password",
    userController.resetPassword
);

module.exports = router;