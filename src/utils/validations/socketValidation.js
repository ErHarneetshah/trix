import jwt from "jsonwebtoken";
import shift from "../../database/models/shiftModel.js";
import team from "../../database/models/teamModel.js";



export const getShiftData = async (id) => {
    try {
        let teamData = await team.findByPk(id)
        let shiftData = await shift.findByPk(teamData.shiftId);
        return shiftData

    } catch (error) {
        return false

    }
}

export const verifyToken = (token) => {   
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
};