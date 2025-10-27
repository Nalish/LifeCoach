import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";

export const addDietician = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      specialization,
      years_of_experience,
      clinic_name,
      clinic_address,
      certification, // ✅ Added field
    } = req.body;

    // ✅ Verify user exists and is actually a dietician (role_id = 4)
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);

    if (!user.rows.length || user.rows[0].role_id !== 4) {
      return res.status(400).json({ message: "User is not a dietician" });
    }

    // ✅ Handle empty or missing specialization gracefully
    const specializationArray =
      Array.isArray(specialization) && specialization.length > 0
        ? specialization
        : "{}"; // fallback to empty Postgres array

    // ✅ Clean up clinic_address input
    const cleanClinicAddress = clinic_address?.trim() || null;

    // ✅ Insert the dietician profile
    const newDietician = await pool.query(
      `INSERT INTO dieticians (
        user_id, specialization, years_of_experience, clinic_name, clinic_address, certification
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id, specializationArray, years_of_experience, clinic_name, cleanClinicAddress, certification]
    );

    // ✅ Mark user profile as complete
    await pool.query("UPDATE users SET profile_complete = TRUE WHERE user_id = $1", [user_id]);

    res.status(200).json({
      message: "Dietician profile successfully completed and saved",
      dietician: newDietician.rows[0],
    });
  } catch (error) {
    console.error("Error adding dietician:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getDietician=asyncHandler(async(req:Request,res:Response)=>{
    try {
         const result=await pool.query(`SELECT * FROM dieticians`)
       
         res.status(200).json({
            message:"Dieticians retrieved",
            dietician:result.rows
        })
    } catch (error) {

        console.error("Error adding dietician", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getDieticianById=asyncHandler(async(req:Request,res:Response)=>{
    try {
        const{id}=req.params
         const result=await pool.query(`SELECT * FROM dieticians WHERE dietician_id=$1`,[id])
        if(result.rowCount===0){
            res.status(400).json({message:"Dietician Not Found"})

        }
         res.status(200).json({
            message:"Dieticians retrieved",
            dietician:result.rows
        })
    } catch (error) {

        console.error("Error adding dietician", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const deleteDietician=asyncHandler(async(req:Request,res:Response)=>{
    try {
         const{id}=req.params
    const result=await pool.query(`DELETE FROM dietician WHERE dietician_id=$1`,[id])

    res.status(200).json({message:"Dietician deleted"})
    } catch (error) {
       console.error("Error deleting dietician", error)
        res.status(500).json({ message: "Internal Server Error" })  
    }
   
})