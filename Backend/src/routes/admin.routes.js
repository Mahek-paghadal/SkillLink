const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { listUsers,getStats } = require("../controllers/admin.controllers");
 
router.get("/users", protect, allowRoles("admin"), listUsers);
router.get("/stats", protect, allowRoles("admin"), getStats);


module.exports = router;