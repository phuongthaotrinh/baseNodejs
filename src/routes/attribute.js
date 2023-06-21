const express = require("express");
import { create, list, remove, read } from "../controllers/attribute.controller";

const router = express.Router();

router.post("/attributes", create);
router.get("/attributes", list);
router.get("/attributes/:id", read);
router.patch("/attributes/:id/remove", remove);


export default router;