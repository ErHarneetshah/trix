import User from "../../database/models/userModel.js";
import department from "../../database/models/departmentModel.js";
import team from "../../database/models/teamModel.js";
import { myCache } from "../../utils/cache.js";
import helper from "../../utils/services/helper.js";
import variables from "../config/variableConfig.js";
import role from "../../database/models/roleModel.js";

async function buildUserTree(parentDept, companyId, level = 0) {
  try {

    // Fetch all child departments
    let children = await department.findAll({
      where: { parentDeptId: parentDept.id, company_id: companyId },
      include: [
        {
          model: team,
          as: "department",
          required:false,
          include: {
            model: User,
            as: "children",
            required:false,

            include: [
              {
                model: role, 
                as: "role",
                required:false
              },
              
            ],
          },
        },
        {
          model: User,
          as: "reportingManager",
          include: [
            {
              model: role,
              as: "role",
              required:false

            },
          ],
        },
      ],
      attributes: ["id", "name", "reportingManagerId"],
    });

    // Convert Sequelize object to plain JSON
    children = JSON.parse(JSON.stringify(children));

    // Add children to parent department
    Object.assign(parentDept, { level });
    Object.assign(parentDept, { children: [] });

    for (const child of children) {
      // Exclude the reportingManager from the members
      if (child.department) {
        for (const team of child.department) {
          team.children = team.children.filter((children) => children.id !== child.reportingManagerId);
        }
      }

      // Recursively build the tree for child departments
      const childTree = await buildUserTree(child, companyId, level + 1);
      parentDept.children.push(childTree);
    }

    return parentDept;
  } catch (error) {
    console.error("Error building user tree:", error);
  }
}

async function getUserTree(parentDept, companyId) {
  const userTree = await buildUserTree(parentDept, companyId);

  return userTree;
}

// Usage example - calling the function to build a tree for a specific user

const viewTreeStructure = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    let tree = {};
    if (myCache.has(`company_${companyId}`)) {
      tree = myCache.get(`company_${companyId}`);
    } else {
      let root_dept = await department.findOne({
        where: {
          isRootId: 1,
          company_id: companyId,
        },
        include: [
          {
            model: User,
            as: "reportingManager",
            include: [
              {
                model: role,
                as: "role",
                required:false

              },
            ],
          },
        ],
        //   raw: true,
      });
      // //({ root_dept });
      if (!root_dept) {
        return helper.failed(res, variables.Success, "please add department first", {});
      }

      root_dept = JSON.parse(JSON.stringify(root_dept));

      tree = await getUserTree(root_dept, companyId);
      myCache.set(`company_${companyId}`, tree, 30);
    }

    return helper.success(res, variables.Success, "tree fetched successfully", tree);
  } catch (error) {

    return helper.failed(res, variables.InternalServerError, error.message, {});
  }
};

// app.get("/admin_tree", async (req, res, next) => {
//     try {
//         const companyId = 1;

//         let tree = {};
//         if (myCache.has(`company_${companyId}`)) {
//             tree = myCache.get(`company_${companyId}`);
//         } else {
//             let root_dept = await department.findOne({
//                 where: {
//                     isRootId: 1,
//                     companyId,
//                 },
//                 include: [
//                     {
//                         model: User,
//                         as: "reportingManager",
//                     },
//                 ],
//                 //   raw: true,
//             });
//             if (!root_dept) {
//                 return null;
//             }

//             root_dept = JSON.parse(JSON.stringify(root_dept));

//             tree = await getUserTree(root_dept, companyId);
//             myCache.set(`company_${companyId}`, tree, 30);
//         }

//         return res.json(tree);
//     } catch (error) {
//     }
// });

export default { viewTreeStructure };
