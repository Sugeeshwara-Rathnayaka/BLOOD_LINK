import express from "express";
import { getAllCampaigns } from "./campaign.controller.js";

const router = express.Router();

// Anyone (even guests) can see upcoming campaigns!
router.get("/", getAllCampaigns);

export default router;
