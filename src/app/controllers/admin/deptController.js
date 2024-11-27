import department from "../../../database/models/departmentModel";
import sequelize from "../../../database/queries/db_connection";
import responseUtils from "../../../utils/common/responseUtils";

class deptController {
    addDept  = async (req, res) => {
        const dbTransaction = await sequelize.transaction();
        try {
            const { name } = req.body;
            if(!name) return responseUtils.errorResponse(res, "Name is Required", 400);

            const existingDept = await department.findOne({ where: { name },
                transaction: dbTransaction, });
            if (existingUser) return responseUtils.errorResponse(res, "Department Already Exists", 400);
              
        } catch (error) {
            
        }
    };

    updateDept  = async (req, res) => {
        try {
            
        } catch (error) {
            
        }
    };

    deleteDept  = async (req, res) => {
        try {
            
        } catch (error) {
            
        }
    };
};

export default deptController;