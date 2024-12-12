import User from "../../database/models/userModel.js";
import department from "../../database/models/departmentModel.js";
import team from "../../database/models/teamModel.js";
import { myCache } from "../../utils/cache.js";
import helper from "../../utils/services/helper.js";
import variables from "../config/variableConfig.js";

async function buildUserTree(parentDept, companyId, level = 0) {
    try {
        console.log("Building tree...");

        // Fetch all child departments
        let children = await department.findAll({
            where: { parentDeptId: parentDept.id, company_id : companyId },
            include: [
                {
                    model: team,
                    as: "department",
                    include: {
                        model: User,
                        as: "children",
                    },
                },
                {
                    model: User,
                    as: "reportingManager",
                },
            ],
            attributes: ["id", "name", "reportingManagerId"],
        });

        // Convert Sequelize object to plain JSON
        children = JSON.parse(JSON.stringify(children));
        console.log({children});

        // Add children to parent department
        Object.assign(parentDept, { level });
        Object.assign(parentDept, { children: [] });

        for (const child of children) {
            // Exclude the reportingManager from the members
            if (child.department) {
                for (const team of child.department) {
                    team.children = team.children.filter(
                        (children) => children.id !== child.reportingManagerId
                    );
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

    console.log({ userTree });
    return userTree;
}

// Usage example - calling the function to build a tree for a specific user

const viewTreeStructure = async (req, res, next) => {

    try {
        const companyId = 101;

        let tree = {};
        if (myCache.has(`company_${companyId}`)) {
            tree = myCache.get(`company_${companyId}`);
        } else {
            let root_dept = await department.findOne({
                where: {
                    isRootId: 1,
                    company_id:companyId,
                },
                include: [
                    {
                        model: User,
                        as: "reportingManager",
                    },
                ],
                //   raw: true,
            });
            console.log({root_dept})
            if (!root_dept) {
                return helper.failed(res , variables.Success , "please add department first" , {})
            }

            root_dept = JSON.parse(JSON.stringify(root_dept));

            tree = await getUserTree(root_dept, companyId);
            myCache.set(`company_${companyId}`, tree, 30);
        }


        return helper.success(res , variables.Success , "tree fetched successfully" , tree )
    } catch (error) {

        console.log({ error });

        return helper.failed(res , variables.InternalServerError , error.message , {})
    }
}

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
//             // console.log({root})
//             if (!root_dept) {
//                 return null;
//             }

//             root_dept = JSON.parse(JSON.stringify(root_dept));

//             tree = await getUserTree(root_dept, companyId);
//             myCache.set(`company_${companyId}`, tree, 30);
//         }


//         return res.json(tree);
//     } catch (error) {
//         console.log({ error });
//     }
// });

export default { viewTreeStructure };
