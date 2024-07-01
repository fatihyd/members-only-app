const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");

router.get("/", messageController.getMessages);

router.get("/sign-up", userController.getSignUpForm);

router.post("/sign-up", userController.signupUser);

router.get("/login", userController.getLoginForm);

router.post("/login", userController.loginUser);

router.get("/logout", userController.logoutUser);

router.get("/create-message", messageController.getMessageForm);

router.post("/create-message", messageController.createMessage);

router.get("/become-member", userController.getMemberForm);

router.post("/become-member", userController.becomeMember);

router.get("/become-admin", userController.getAdminForm);

router.post("/become-admin", userController.becomeAdmin);

router.post("/delete-message/:id", messageController.deleteMessage);

module.exports = router;
