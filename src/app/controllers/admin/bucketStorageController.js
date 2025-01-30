import axios from "axios";
import { BucketCredentialsModel } from "../../../database/models/BucketCredentialModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import appConfig from "../../config/appConfig.js";
import variables from "../../config/variableConfig.js";
import company from "../../../database/models/company.js";
import { bucketImageUpload } from "../../../database/models/bucketImageModel.js";

const appConfigInstance = new appConfig();

const getAllBucketCredentials = async (req, res) => {
  try {
    const allData = await BucketCredentialsModel.findAll();
    if (!allData) return helper.failed(res, variables.NotFound, "No Credentials Found");

    return helper.success(res, variables.Success, "All Bucket Credentials Retrieved Successfully", allData);
  } catch (error) {
    console.log("Error in Bucket Controller (getAllBucketCredentails): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to Get Bucket Credentials");
  }
};

const getSingleBucketCredential = async (req, res) => {
  try {
    const allData = await BucketCredentialsModel.findOne({
      where: { company_id: req.user.company_id },
    });
    if (!allData) return helper.failed(res, variables.NotFound, "No Credentials Found");

    return helper.success(res, variables.Success, "Bucket Credentials Retrieved Successfully", allData);
  } catch (error) {
    console.log("Error in Bucket Controller (getSingleBucektCredential): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to Get Bucket Credentials");
  }
};

const addBucketCredential = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    if (!req.user.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized.Only Admin have permission");
    const { access_key, secret_key, bucket_name, host_endpoint, region } = req.body;

    const alreadyCredentialsExists = await BucketCredentialsModel.count({
      where: { company_id: req.user.company_id },
    });
    if (alreadyCredentialsExists > 0) return helper.failed(res, variables.Unauthorized, "Not Allowed to add more than 1 Bucket Credential");

    const constraints = {
      company_id: req.user.company_id,
      access_key: access_key,
      secret_key: secret_key,
      bucket_name: bucket_name,
    };

    for (const [key, value] of Object.entries(constraints)) {
      const condition = {};
      condition[key] = value;

      const alreadyExists = await BucketCredentialsModel.count({
        where: condition,
        company_id: { [Op.not]: req.user.company_id },
      });

      if (alreadyExists > 0) {
        return helper.failed(res, variables.Unauthorized, `${key} value already exists in system.`);
      }
    }

    const allData = await BucketCredentialsModel.create(
      {
        company_id: req.user.company_id,
        access_key: access_key,
        secret_key: secret_key,
        bucket_name: bucket_name,
        host_endpoint: host_endpoint,
        region: region,
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "Bucket Credentials Created Successfully", allData);
  } catch (error) {
    if (dbTransaction) await dbTransaction.rollback();
    console.log("Error in Bucket Controller (addBucketCredential): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to add Bucket Credentials");
  }
};

const updateBucketCredential = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    if (!req.user.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized.Only Admin have permission");
    const { host, region, bucket_name, access_key, secret_key } = req.body;

    const constraints = {
      access_key: access_key,
      secret_key: secret_key,
      bucket_name: bucket_name,
    };

    for (const [key, value] of Object.entries(constraints)) {
      const condition = {};
      condition[key] = value;

      const alreadyExists = await BucketCredentialsModel.count({
        where: condition,
        company_id: { [Op.not]: req.user.company_id },
      });

      if (alreadyExists > 0) {
        return helper.failed(res, variables.Unauthorized, `${key} value already exists in system.`);
      }
    }

    await BucketCredentialsModel.update(
      {
        host: host,
        access_key: access_key,
        secret_key: secret_key,
        bucket_name: bucket_name,
        region: region,
      },
      {
        where: { company_id: req.user.company_id },
        transaction: dbTransaction,
      }
    );

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "Bucket Credentials Updated Successfully");
  } catch (error) {
    if (dbTransaction) await dbTransaction.rollback();
    console.log("Error in Bucket Controller (updateBucketCredential): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to update Bucket Credentials");
  }
};

const deleteBucketCredential = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    await BucketCredentialsModel.destroy({
      where: { company_id: req.user.company_id },
      transaction: dbTransaction,
    });

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "Bucket Credentials Deleted Successfully");
  } catch (error) {
    if (dbTransaction) await dbTransaction.rollback();
    console.log("Error in Bucket Controller (deleteBucketCredential): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to delete Bucket Credentials");
  }
};

// const getBucketObjects = async (req, res) => {
//   const dbTransaction = await sequelize.transaction();
//   try {
//     let { user_id } = req.body;

//     let getBucketCredentials = await BucketCredentialsModel.findOne({
//       where: { company_id: req.user.company_id },
//     });

//     if (!getBucketCredentials) {
//       getBucketCredentials = null;
//     }

//     let getUploadRecord = await bucketImageUpload.findAll({
//       where: { user_id: user_id, company_id: req.user.company_id },
//       attributes: ["image_name"],
//     });
//     if (!getUploadRecord) return helper.failed(res, variables.NotFound, "No Image is Uploaded");

//     const response = await axios.post(`${appConfigInstance.getBucketUrl()}/api/structure/getSingleBucketContents`, {
//       product_key: appConfigInstance.getEmonKey(),
//       credentials: getBucketCredentials,
//       uploadRecords: getUploadRecord,
//     });

//     if (response.data.status) {
//       return helper.success(res, variables.Success, response.data.message, response.data.data);
//     } else {
//       return helper.failed(res, variables.BadRequest, response.data.message);
//     }
//   } catch (error) {
//     console.log("Error in Bucket Controller: ", error.message);
//     return helper.failed(res, variables.BadRequest, "Unable to upload Image");
//   }
// };

const uploadBucketImage = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    let { user_id, company_id, image_data } = req.body;

    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: company_id },
    });

    if (!getBucketCredentials) {
      getBucketCredentials = null;
    }

    const uploadKey = await company.findOne({
      where: { id: company_id },
      attributes: ["bucketStorePath"],
    });

    const response = await axios.post(`${appConfigInstance.getBucketUrl()}/api/upload/uploadMedia`, {
      product_key: appConfigInstance.getEmonKey(),
      credentials: getBucketCredentials,
      mediaData: image_data,
      mediaType: 1,
      key: uploadKey.bucketStorePath,
    });

    if (response.data.status) {
      await bucketImageUpload.create(
        {
          user_id: user_id,
          company_id: company_id,
          image_name: response.data.data.image_name,
          image_upload_path: response.data.data.image_upload_path,
          bucket_owner: response.data.data.bucket_owner,
          date: response.data.data.date,
        },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.success(res, variables.Success, response.data.message, response.data.data);
    } else {
      return helper.failed(res, variables.BadRequest, response.data.message);
    }
  } catch (error) {
    console.log("Error in Bucket Controller (uploadBucketImage): ", error.message);
    await dbTransaction.rollback();
    return helper.failed(res, variables.BadRequest, "Unable to upload Image");
  }
};

const deleteBucketImage = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    console.log("delete Bucket Image Emonirtxi");
    const date = new Date();
    const today = new Date(date).toISOString().split("T")[0];
    let deleteRequests = [];
    let keys = [];

    const companies = await company.findAll();

    for (const company of companies) {
      let getCredentials = await BucketCredentialsModel.findOne({
        where: { company_id: company.id },
      });
      if (!getCredentials) getCredentials = null;

      const planEndDate = new Date(company.planEndDate);
      const extendedPlanEndDate = new Date(planEndDate);
      extendedPlanEndDate.setDate(planEndDate.getDate() + 30);
      const formattedExtendedDate = extendedPlanEndDate.toISOString().split("T")[0];

      if (formattedExtendedDate >= today) {
        const bucketImages = await bucketImageUpload.findAll({
          where: { company_id: company.id, date: formattedExtendedDate },
        });

        for (const image of bucketImages) {
          deleteRequests.push(
            axios.post(`${appConfigInstance.getBucketUrl()}/api/upload/deleteMedia`, {
              product_key: appConfigInstance.getEmonKey(),
              credentials: getCredentials,
              key: image.image_upload_path,
            })
          );
          keys.push(image.image_upload_path);
        }
      }
    }

    const responses = await Promise.all(deleteRequests);
    const failedRequests = responses.filter((response) => !response.data.status);
    if (failedRequests.length > 0) {
      return helper.failed(res, variables.BadRequest, `${failedRequests.length} delete operations failed.`);
    }

    for (const record of keys) {
      await bucketImageUpload.destroy(
        {
          where: { image_upload_path: record },
        },
        { transaction: dbTransaction }
      );
    }

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "All delete operations completed successfully.");
  } catch (error) {
    await dbTransaction.rollback();
    console.log("Error in Bucket Controller (deleteBucketImage): ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to upload Image");
  }
};

// const retrieveBucketImages = async (req, res) => {
const retrieveBucketImages = async (company_id, user_id, date, limit = null, page = null) => {
  const dbTransaction = await sequelize.transaction();
  try {
    console.log("Company_id: ", company_id);
    console.log("User_id: ", user_id);
    console.log("Date: ", date)
    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: company_id },
    });
    if (!getBucketCredentials) {
      getBucketCredentials = {
        host: process.env.LINODE_HOST,
        region: process.env.LINODE_REGION,
        access_key: process.env.LINODE_ACCESS_KEY,
        secret_key: process.env.LINODE_SECRET_KEY,
        bucket_name: process.env.LINODE_BUCKET_NAME,
      };
    }

    let keys = [];
    let offset = null;
    let imageRecords;

    if (!limit || !page) {
      imageRecords = await bucketImageUpload.findAndCountAll({
        where: {user_id: user_id, company_id: company_id, date: date},
        order: [["createdAt", "DESC"]],
      });
    } else {
      limit = parseInt(limit) || 4;
      offset = (page - 1) * limit || 0;
      let where = {};
      where.company_id = company_id;
      where.user_id = user_id;
      where.date = date;

      imageRecords = await bucketImageUpload.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });
    }

    for (const record of imageRecords.rows) {
      keys.push({ host: getBucketCredentials.host, region: getBucketCredentials.region, bucket_name: getBucketCredentials.bucket_name, path: record.image_upload_path });
    }

    let data = {
      status: true,
      message: "Image Records Recieved Successfully",
      limit: limit,
      offset: offset,
      page: page,
      count: imageRecords.count,
      data: keys
    }
    console.log(data);
    return data;
  } catch (error) {
    console.log("Error in Bucket Controller (retrieveBucketImages): ", error.message);
    return [];
  }
};

const retrieveBucketImagesSeparate = async (company_id, user_id, date, limit = null, page = null) => {
  const dbTransaction = await sequelize.transaction();
  try {
    console.log("Company_id: ", company_id);
    console.log("User_id: ", user_id);
    console.log("Date: ", date)
    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: company_id },
    });
    if (!getBucketCredentials) {
      getBucketCredentials = {
        host: process.env.LINODE_HOST,
        region: process.env.LINODE_REGION,
        access_key: process.env.LINODE_ACCESS_KEY,
        secret_key: process.env.LINODE_SECRET_KEY,
        bucket_name: process.env.LINODE_BUCKET_NAME,
      };
    }

    let keys = [];
    let offset = null;
    let imageRecords;

    if (!limit || !page) {
      imageRecords = await bucketImageUpload.findAndCountAll({
        where: {user_id: user_id, company_id: company_id, date: date},
        order: [["createdAt", "DESC"]],
      });
    } else {
      limit = parseInt(limit) || 4;
      offset = (page - 1) * limit || 0;
      let where = {};
      where.company_id = company_id;
      where.user_id = user_id;
      where.date = date;

      imageRecords = await bucketImageUpload.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });
    }

    for (const record of imageRecords.rows) {
      keys.push({ host: getBucketCredentials.host, region: getBucketCredentials.region, bucket_name: getBucketCredentials.bucket_name, path: record.image_upload_path });
    }

    return keys;
  } catch (error) {
    console.log("Error in Bucket Controller (retrieveBucketImages): ", error.message);
    return [];
  }
};

export default {
  getAllBucketCredentials,
  getSingleBucketCredential,
  addBucketCredential,
  updateBucketCredential,
  deleteBucketCredential,
  uploadBucketImage,
  // getBucketObjects,
  deleteBucketImage,
  retrieveBucketImages,
  retrieveBucketImagesSeparate,
};
