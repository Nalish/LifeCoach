import express from "express"
import { addInstructor, deleteInstuctor, getInstructors, getInstuctorById } from "../controllers/instructorsController";
import { protect } from './../middlewares/auth/protect';
import { adminGuard } from "../middlewares/auth/roleMiddleware";


const router=express.Router()

router.post("/",protect,addInstructor)
router.get("/", protect,getInstructors)
router.get("/:id",protect,getInstuctorById)
router.delete("/:id",protect,adminGuard,deleteInstuctor)


export default router;
