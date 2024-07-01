const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("author")
      .sort({ added: -1 });
    res.render("messages", { messages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching messages!");
  }
};

exports.getMessageForm = (req, res) => {
  res.render("create-message");
};

exports.createMessage = async (req, res) => {
  const newMessage = new Message({
    text: req.body.message,
    author: req.user,
    added: new Date(),
  });

  try {
    await newMessage.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new message!");
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting a message!");
  }
};
