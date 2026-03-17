import express from "express";
import {
  sendMessage,
  getMessage,
  reactToMessage,
  deleteMessage,
  checkAbuse
} from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.post("/react/:id", secureRoute, reactToMessage);
router.delete("/delete/:id", secureRoute, deleteMessage);
router.post("/check-abuse", secureRoute, checkAbuse);

export default router;
