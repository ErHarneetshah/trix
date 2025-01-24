import axios from "axios";
import { BucketCredentialsModel } from "../../../database/models/BucketCredentialModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import appConfig from "../../config/appConfig.js";
import variables from "../../config/variableConfig.js";

const appConfigInstance = new appConfig();

const getAllBucketCredentials = async (req, res) => {
  try {
    const allData = await BucketCredentialsModel.findAll();
    if (!allData) return helper.failed(res, variables.NotFound, "No Credentials Found");

    return helper.success(res, variables.Success, "All Bucket Credentials Retrieved Successfully", allData);
  } catch (error) {
    console.log("Error in Bucket Controller: ", error.message);
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
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to Get Bucket Credentials");
  }
};

const addBucketCredential = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    const { access_key, secret_key, bucket_name, host, region } = req.body;
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
        host: host,
        region: region,
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "Bucket Credentials Created Successfully", allData);
  } catch (error) {
    if (dbTransaction) await dbTransaction.rollback();
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to add Bucket Credentials");
  }
};

const updateBucketCredential = async (req, res) => {
  try {
    const dbTransaction = await sequelize.transaction();
    const { id, company_id, createdAt, updatedAt, ...updateData } = req.body;

    const constraints = {
      access_key: updateData.access_key,
      secret_key: updateData.secret_key,
      bucket_name: updateData.bucket_name,
    };

    for (const [key, value] of Object.entries(constraints)) {
      const condition = {};
      condition[key] = value;

      const alreadyExists = await BucketCredentialsModel.count({
        where: condition,
      });

      if (alreadyExists > 0) {
        return helper.failed(res, variables.Unauthorized, `${key} value already exists in system.`);
      }
    }

    await BucketCredentialsModel.update(
      {
        ...updateData,
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
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to update Bucket Credentials");
  }
};

const deleteBucketCredential = async (req, res) => {
  try {
    const dbTransaction = await sequelize.transaction();
    await BucketCredentialsModel.destroy({
      where: { company_id: req.user.company_id },
      transaction: dbTransaction,
    });

    await dbTransaction.commit();
    return helper.success(res, variables.Success, "Bucket Credentials Deleted Successfully");
  } catch (error) {
    if (dbTransaction) await dbTransaction.rollback();
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to delete Bucket Credentials");
  }
};

const uploadBucketImage = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    let {company_id, image_data} = req.body;

    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: company_id },
    });

    if (!getBucketCredentials) {
      getBucketCredentials = null;
    }

    // const response = await axios.post(`${appConfigInstance.getBucketUrl()}/api/structure/getSingleBucketContents`, {
    //   product_key: appConfigInstance.getEmonKey(),
    //   credentials: getBucketCredentials,
    // });

    const response = await axios.post(`${appConfigInstance.getBucketUrl()}/api/upload/uploadMedia`, {
      product_key: appConfigInstance.getEmonKey(),
      credentials: getBucketCredentials,
      mediaData: image_data,
      mediaType: 1,
      key: req.user.image_storage_path,
    });

    if (response.data.status) {
      return helper.success(res, variables.Success, response.data.message, response.data.data);
    }else{
      return helper.failed(res, variables.BadRequest, response.data.message);
    }
  } catch (error) {
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to upload Image");
  }
};

const getBucketObjects = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {

    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: 1 },
    });

    if (!getBucketCredentials) {
      getBucketCredentials = null;
    }

    const response = await axios.post(`${appConfigInstance.getBucketUrl()}/api/structure/getSingleBucketContents`, {
      product_key: appConfigInstance.getEmonKey(),
      credentials: getBucketCredentials,
    });

    if (response.data.status) {
      return helper.success(res, variables.Success, response.data.message, response.data.data);
    }else{
      return helper.failed(res, variables.BadRequest, response.data.message);
    }
  } catch (error) {
    console.log("Error in Bucket Controller: ", error.message);
    return helper.failed(res, variables.BadRequest, "Unable to upload Image");
  }
};

export default { getAllBucketCredentials, getSingleBucketCredential, addBucketCredential, updateBucketCredential, deleteBucketCredential, uploadBucketImage, getBucketObjects };
