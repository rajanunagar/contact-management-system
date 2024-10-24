import React from 'react'
import { useState, useEffect } from 'react';
import api from '../api/api';
import Loading from './Loading';
import { toast } from 'react-toastify';
import emptyProfie from '../assets/images/emptyProfile.png';
import DeleteModel from './models/DeleteModel';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/user/userSlice';
import ChangePasswordModel from './models/ChangePasswordModel';
import AddOrUpdateUserImageModel from './models/AddOrUpdateUserImageModel';

function Profile() {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [image, setImage] = useState('');
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
    const [isChangePasswordModelOpen, setIsChangePasswordModelOpen] = useState(false)
    const [isAddorUpdateUserImageModelOpen, setIsAddorUpdateUserImageModelOpen] = useState(false)
    const [_id, setId] = useState('');
    const [isUserUpdating, setIsUserUpdating] = useState(false);
    const dispatch = useDispatch();
    const userInfo = useSelector((store) => store.user.userInfo);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullname: "",
        gender: "",
    });
    const gender = ['Male', 'Female', 'Other'];

    const getUser = async () => {
        try {
            setFetching(true);
            const userRes = await api.user.getCurrentUser();
            setSuccess(true);
            let { fullname, username, gender, email } = userRes.data;
            setFormData({ fullname: fullname, username: username, gender: gender, email: email });
            setImage(userRes.data.image);
        } catch (err) {
            setError(true);
        }
        setFetching(false);
    };
    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.username) {
            tempErrors["username"] = "Username is required";
            isValid = false;
        }
        if (!formData.fullname) {
            tempErrors["fullname"] = "fullname is required";
            isValid = false;
        }
        if (!formData.gender) {
            tempErrors["gender"] = "gender is required";
            isValid = false;
        } else if (!(formData.gender === "Male" || formData.gender === "Female" || formData.gender === "Other")) {
            tempErrors["gender"] = "Gender must be one of Male, Female, Other";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            const user = JSON.parse(JSON.stringify(formData));
            try {
                delete user.email;
                setIsUserUpdating(true);
                const usersRes = await api.user.updateCurrentUser(user);
                toast.success('User Updated Successfully');
                dispatch(setUser({ ...userInfo, username: user.username }))
                setSuccess(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {
                    console.log(err);
                }
            }
            setIsUserUpdating(false);
        }
    };
    function onDeleteUser(id) {
        setId(id);
        setIsDeleteModelOpen(true);
    };
    function HandleOnDeleteUser(value) {
        setIsDeleteModelOpen(false);
    };
    function handleChangePassword(value) {
        setIsChangePasswordModelOpen(false);
        if (value) {
            getUser();
        }
    }
    function handleAddOrUpdateUserImageModel(value) {
        setIsAddorUpdateUserImageModelOpen(false);
        if (value) {
            getUser();
        }
    }

    useEffect(() => {
        getUser();
    }, []);

    return (
        <>

            {success && <section className="" >
                {isDeleteModelOpen &&
                    <DeleteModel _id={_id} aboutToDelete='yourself' isDeleteModelOpen={isDeleteModelOpen} HandleOnDelete={HandleOnDeleteUser} />
                }
                {
                    isChangePasswordModelOpen && <ChangePasswordModel open={isChangePasswordModelOpen} handleChangePassword={handleChangePassword} />
                }
                {
                    isAddorUpdateUserImageModelOpen && <AddOrUpdateUserImageModel open={isAddorUpdateUserImageModelOpen} handleAddOrUpdateUserImageModel={handleAddOrUpdateUserImageModel} operation={image ? 'Update' : 'Add'} />
                }
                {!fetching && <div className="container py-5 ">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col col-lg-8  mb-lg-0">
                            <div className="card p-3" style={{ borderRadius: ".5rem", backgroundColor: '#c5ecee' }}>
                                <div className="row g-0 justify-content-center">
                                    <div className="col-md-5  text-center text-white mt-5"
                                        style={{ borderTopLeftRadius: ".5rem", borderBottomLeftRadius: ".5rem", }}
                                    >
                                        {image && <img
                                            src={`http://localhost:5001/Images/${image}`}
                                            alt="..."
                                            className='img-fluid'
                                        />
                                        }
                                        {
                                            !image && <img src={emptyProfie} className='img-fluid img-thumbnail card-img-top' alt='user profile' />
                                        }
                                        <div className="card-body">
                                            <div className='d-flex justify-item-center mt-2'>
                                                <button className="btn btn-secondary card-link" onClick={() => setIsChangePasswordModelOpen(true)}><svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={16}
                                                    height={16}
                                                    fill="currentColor"
                                                    className="bi bi-pencil-square"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                    />
                                                </svg> Password</button>
                                                <button className="btn btn-secondary card-link" onClick={() => setIsAddorUpdateUserImageModelOpen(true)}>{image ? <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={16}
                                                    height={16}
                                                    fill="currentColor"
                                                    className="bi bi-pencil-square"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                    />
                                                </svg> : <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-person-plus-fill" viewBox="0 0 16 16">
                                                    <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                                                    <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" />
                                                </svg>} img</button>
                                                <button className="btn btn-danger card-link" onClick={() => onDeleteUser()}><svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={16}
                                                    height={16}
                                                    fill="currentColor"
                                                    className="bi bi-trash3-fill"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                </svg> User</button>
                                            </div>
                                        </div>
                                    </div>
                                    < div className="col-md-7">
                                        <div className="card-body p-4">
                                            <h6 className="card-title">Update User</h6>
                                            <hr className="mt-0 mb-4"></hr>
                                            <div className="row pt-1 justify-content-center">
                                                <div className="col-10 mb-3">
                                                    <form onSubmit={handleSubmit} noValidate className="my-3">
                                                        <div className="form-group">
                                                            <label htmlFor="email">Email</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                className="form-control"
                                                                id="email"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                required
                                                                disabled
                                                            />
                                                            {errors.email && (
                                                                <small id="emailHelp" className="form-text text-danger">
                                                                    {errors.email}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="username">User Name</label>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                className="form-control"
                                                                id="username"
                                                                placeholder="Username"
                                                                value={formData.username}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            {errors.username && (
                                                                <small id="usernameHelp" className="form-text text-danger">
                                                                    {errors.username}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="fullname">Full Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="fullname"
                                                                id="fullname"
                                                                placeholder="Fullname"
                                                                value={formData.fullname}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            {errors.fullname && (
                                                                <small
                                                                    id="fullnameHelp"
                                                                    className="form-text text-danger"
                                                                >
                                                                    {errors.fullname}
                                                                </small>
                                                            )}
                                                        </div>

                                                        <div className="form-group my-2">
                                                            <label htmlFor="gender">Gender</label>
                                                            <select className="form-select" name="gender" onChange={handleChange} value={formData.gender} aria-label="Default select example">
                                                                <option defaultValue={'select'}>Select Gender</option>
                                                                {
                                                                    gender.map((rec) => (<option key={rec} value={rec}>{rec}</option>))
                                                                }
                                                            </select>
                                                            {errors.gender && (
                                                                <small
                                                                    id="genderHelp"
                                                                    className="form-text text-danger"
                                                                >
                                                                    {errors.gender}
                                                                </small>
                                                            )}
                                                        </div>
                                                        {!isUserUpdating && <button type="submit" className="btn btn-secondary mt-3 card-link">
                                                            Submit
                                                        </button>}
                                                        {isUserUpdating && <div className="spinner-border" role="status">
                                                            <span className="sr-only">  </span>
                                                        </div>
                                                        }
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div >
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
                }
            </section >
            }
            {fetching && <Loading />}
            {/* {error && <p>Error</p>}  */}
        </>
    )
}

export default Profile

