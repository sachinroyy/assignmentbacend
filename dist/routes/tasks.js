"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post("/", taskController_1.createTask);
router.get("/", taskController_1.getTasks);
router.put("/:id", taskController_1.updateTask);
router.delete("/:id", taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map