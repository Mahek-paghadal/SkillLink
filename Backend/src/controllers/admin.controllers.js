const User = require("../models/User");
const Student = require("../models/Student");
const Client = require("../models/Client");
const Admin = require("../models/Admin");


exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const clients = await Client.countDocuments();
    const admins = await Admin.countDocuments();

    res.json({ students, clients, admins });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};