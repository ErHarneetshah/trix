import languageDropdown from "../../../database/models/languageModel.js";
import languageSettings from "../../../database/models/languageSettingsModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";


const getLanguageDropdown = async (req, res) => {
    try {
        const getLanguageData = await languageDropdown.findAll({ attributes: ["id", "language"] });
        if (!getLanguageData || getLanguageData.length === 0) return helper.failed(res, variables.Success, "Please add the data in the database to see the languages data");
        return helper.success(res, variables.Success, "Language Dropdown Retrieved Successfully", getLanguageData);
    } catch (error) {
        console.error("Error fetching languages:", error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};

const updateLanguage = async (req, res) => {
    try {
        let { language_id, theme_id } = req.body;
        // get previous theme status
        const getPreviousThemeStatus = await languageSettings.findOne({  where: { user_id: req.user.id ,company_id : req.user.company_id }, attributes: ["id", "language_id", "theme_id"] });
        
        language_id = language_id ? language_id : getPreviousThemeStatus.language_id;
        theme_id = theme_id ? theme_id : getPreviousThemeStatus.theme_id;
        
        if ( typeof language_id == "string"  ) return helper.failed(res, variables.ValidationError, "Please provide valid language id and in numbers");
        if ( typeof theme_id == "string"  ) return helper.failed(res, variables.ValidationError, "Please provide valid theme id and in numbers");
        

        const isLanguageExists = await languageDropdown.findByPk(language_id);
        if (!isLanguageExists) {
            return helper.failed(res, variables.NotFound, "Language does not exists in our records.");
        }
        if (theme_id < 1 || theme_id > 2) {
            return helper.failed(res, variables.ValidationError, "Theme id  must be 1 or 2");
        }
        const settings = await languageSettings.update({
            language_id: language_id,
            theme_id: theme_id
        }, { where: { user_id: req.user.id } });
        return helper.success(res, variables.Success, "Language Updated Successfully");

    } catch (error) {
        console.error("Error while updating the languages:", error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};

const getThemeStatus = async(req,res) => {
    try {
        const theme = await languageSettings.findOne({
            where: { user_id: req.user.id },
            attributes: ["id", "language_id", "theme_id"], 
            include: [
                {
                  model: languageDropdown,
                  as: "language",
                  attributes: ["language"],
                },
              ]
        });
        console.log("theme",theme);
        const themeMapping = { 1: "LTR", 2: "RTL"};
        const themeType = theme ?  themeMapping[theme.theme_id] : "unknown";
        if (!theme || theme.length === 0 || theme.theme_id === undefined) return helper.failed(res, variables.NotFound, "Theme status Not found");
        return helper.success(res, variables.Success, "Theme Status Retrieved Successfully", theme, { themeType });

    } catch (error) {
        console.error("Error while updating the languages:", error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
}


export default { getLanguageDropdown, updateLanguage,getThemeStatus };


