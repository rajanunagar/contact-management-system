import axios from "axios";
import { setHeader } from "../functions/function";

const baseUrl = 'http://localhost:5001/api/';
axios.defaults.baseURL = baseUrl;

const auth = {
    login: (data) => {
        return axios.post('user/login', data);
    },
    register: (data) => {
        return axios.post('user/register', data);
    },
    tokenValid: () => {
        return axios.get('validatetoken', setHeader());
    },
    mailForgotPasswordLink: (data) => {
        return axios.post('user/forgot-password', data);
    }
    ,
    // fileUpload: (data) => {
    //     return axios.post('upload', data);
    // },
    // getFiles: () => {
    //     return axios.get('upload');
    // },

}
const user = {
    getCurrentUser: () => {
        return axios.get('user/current', setHeader());
    },
    getAllUsers: (pageNo = 1, contactPerPage = 10, searchInput = '') => {
        return axios.get(`user?page=${pageNo}&size=${contactPerPage}&name=${searchInput}`, setHeader());
    },
    getUserById: (id) => {
        return axios.get(`user/${id}`, setHeader())
    }
    ,
    updateCurrentUser: (data) => {
        return axios.put('user', data, setHeader());
    },
    updateUserPassword: (data) => {
        return axios.put('user/updatepassword', data, setHeader());
    },
    updateUserbyAdmin: (id, data) => {
        return axios.put(`user/${id}`, data, setHeader());
    }
    ,
    fileUpload: (data) => {
        return axios.post('user/image', data, setHeader());
    },
    deleteUserByAdmin: (id) => {
        return axios.delete(`user/${id}`, setHeader());
    },
    deleteUser: () => {
        return axios.delete('user', setHeader());
    }
}
const contact = {
    getContactByUserId: (pageNo = 1, contactPerPage = 10, searchInput = '') => {
        return axios.get(`contact?page=${pageNo}&size=${contactPerPage}&name=${searchInput}`, setHeader());
    },
    addContactByUserId: (data) => {
        return axios.post('contact', data, setHeader());
    },
    deleteContactById: (id) => {
        return axios.delete(`contact/${id}`, setHeader());
    },
    updateContactById: (id, data) => {
        return axios.put(`contact/${id}`, data, setHeader());
    },
    getContactById: (id) => {
        return axios.get(`contact/${id}`, setHeader());
    },
    bulkImportContactByUsrId: (data) => {
        return axios.post('contact/bulkimport', data, setHeader());
    }
}
const otp = {
    sendOtp: (data) => {
        return axios.post('otp', data);
    },
    varifyOtp: (data) => {
        return axios.post('otp/varify', data);
    }
}

const api = {
    auth,
    contact,
    user,
    otp
}
export default api;