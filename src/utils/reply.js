export default {
    success: (res, statusCode, message, data = null, extra = null) => {
        var result = {
            status: "1",
            status_text: "success",
            message: message,
        };

        if (data != null || data == []) {
            result['data'] = data;
        }

        if (extra != null) {
            Object.assign(result, extra);
        }

        return res.status(statusCode).json(result);
    },

    failed: (res, statusCode, message, data = null) => {
        var result = {
            status: 0,
            message: message || "something went wrong",
        }

        if (data != null || data == []) {
            result['data'] = data;
        }

        return res.status(statusCode).json(result);
    },

    unauth: () => {
        return {
            status: "0",
            status_text: "failed",
            message: 'Unauthenticated',
        }
    },

    // notfound: () => {
    //     return {
    //         status: "0",
    //         status_text: "failed",
    //         message: 'Not Found',
    //     }
    // },

    s_success: (message, data = null, extra = null) => {
        var result = {
            status: "1",
            status_text: "success",
            message: message,
        };

        if (data != null || data == []) {
            result['data'] = data;
        }

        if (extra != null) {
            Object.assign(result, extra);
        }

        return result;
    },

    s_failed: (message) => {
        return {
            status: "0",
            status_text: "failed",
            message: message,
        }
    },


};