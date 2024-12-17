

const sendEmailWithReports = async (req, res) => {
    try {
      
    } catch (error) {
        console.error("Error fetching languages:", error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};