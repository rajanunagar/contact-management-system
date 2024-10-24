import React, { useState, useEffect } from "react";
import api from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";

function Registration() {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchingOtp, setFetchingOtp] = useState(false);
    const [fetchingVarifyingOtp, setFetchingVarifyingOtp] = useState(false);
    const [isMailSent, setIsMailSent] = useState(false);
    const [isEmailVarified, setIsEmailVarified] = useState(false);
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPasswordd] = useState(false);
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullname: "",
        gender: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });
    const gender = ['Male', 'Female', 'Other'];
    const [seconds, setSeconds] = useState(60);
    const displaySeconds = seconds % 60;
    const displayMinutes = Math.floor(seconds / 60);
    const [selectdFileError, setSelectdFileError] = useState([]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': []
        },
        maxFiles: 1,
        onDrop: (acceptedFiles, rejectedFiles) => {
            setSelectdFileError('');
            setImage(acceptedFiles[0]);
        },
        onDropRejected: (rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                const errorType = rejectedFiles[0].errors[0].code;
                let errorMessage;
                console.log(errorType);
                if (errorType === 'file-invalid-type') {
                    errorMessage = 'Please select an image file.';
                } else if (errorType == 'too-many-files') {
                    errorMessage = 'Only one image can be selected at a time.';
                } else {
                    errorMessage = 'An error occurred.';
                }
                setSelectdFileError(errorMessage);
            }
            else
                setSelectdFileError('An error occurred.');
        }
    });

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            setIsMailSent(false);
        }
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPasswordd(!showConfirmPassword);
    };
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.email) {
            tempErrors["email"] = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors["email"] = "Email is invalid";
            isValid = false;
        }
        if (!formData.username) {
            tempErrors["username"] = "Username is required";
            isValid = false;
        }
        else if (formData.username.length < 3) {
            tempErrors["username"] = "Username must be at least 3 characer long";
            isValid = false;
        }
        if (!formData.fullname) {
            tempErrors["fullname"] = "fullname is required";
            isValid = false;
        }
        if (!formData.password) {
            tempErrors["password"] = "Password is required";
            isValid = false;
        } else if (formData.password.length < 4) {
            tempErrors["password"] = "Password must be at least 4 characters";
            isValid = false;
        }
        if (!formData.otp) {
            tempErrors["otp"] = "Otp is required";
            isValid = false;
        } else if (formData.otp.length !== 6) {
            tempErrors["otp"] = "otp must have 6 character";
            isValid = false;
        }
        if (!formData.confirmPassword) {
            tempErrors["confirmPassword"] = "Confirm password is required";
            isValid = false;
        } else if (formData.confirmPassword !== formData.password) {
            tempErrors["confirmPassword"] = "Passwords do not match";
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
            const data = new FormData();
            for (const key in formData) {
                if (key !== "confirmPassword")
                    data.append(key, formData[key]);
            }
            if (image) {
                data.append('file', image);
            }
            try {
                setFetching(true);
                delete user.confirmPassword;
                const usersRes = await api.auth.register(data);
                toast.success('User Register Successfully');
                navigate('/login');
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
        }
        setFetching(false);
    };
    const sendOtp = async () => {
        let isValid = true;
        let emailError = '';
        if (!formData.email) {
            emailError = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            emailError = "Email is invalid";
            isValid = false;
        }
        if (isValid) {
            setErrors((error) => ({ ...error, ['email']: '' }));
            try {
                setIsMailSent(false);
                setFetchingOtp(true);
                const response = await api.otp.sendOtp({ email: formData.email });
                setIsMailSent(true);
                toast.success('otp send successfully and varify otp within 5 minutes');
            }
            catch (error) {
                toast.error(error.response.data.message);
                setIsMailSent(false)
            }
            setFetchingOtp(false);
        }
        else {
            setErrors((error) => ({ ...error, ['email']: emailError }));
        }
    }
    const verifyOtp = async () => {
        let isValid = true;
        let otpError = '';
        if (!formData.otp) {
            otpError = "Otp is required";
            isValid = false;
        } else if (formData.otp.length !== 6) {
            otpError = "otp must have 6 character";
            isValid = false;
        }
        if (isValid) {
            try {
                setErrors((error) => ({ ...error, ['otp']: '' }));
                setFetchingVarifyingOtp(true);
                const response = await api.otp.varifyOtp({ email: formData.email, otp: formData.otp });
                setIsEmailVarified(true);
                toast.success(response.data.message);
            }
            catch (error) {
                toast.error(error.response.data.message);
                setIsEmailVarified(false)
            }
            setFetchingVarifyingOtp(false);
        }
        else {
            setErrors((error) => ({ ...error, ['otp']: otpError }));
        }
    }

    useEffect(() => {
        let timeout;
        if (seconds > 0) {
            timeout = setTimeout(() => {
                setSeconds((state) => state - 1);
            }, 1000);
        } else {
            clearTimeout(timeout);
        }
    }, [seconds])
    useEffect(()=>{
        if(token)
        navigate('/');
    },[token]);

    return (
        <div className="container" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                        <div className="card-body  px-0 mx-0">
                            <h5 className="card-title text-primary" >Registration</h5>
                            <hr />
                            <div className="px-3">
                                <form onSubmit={handleSubmit} noValidate className="my-3">
                                    {!isMailSent && (
                                        <>
                                            <p className="card-subtitle mb-2 text-muted">Step-1/3 : Send OTP</p>
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    id="email"
                                                    placeholder="Enter email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    disabled={isMailSent}
                                                    required
                                                />
                                                {!fetchingOtp && <button type="button" className="btn btn-primary mt-3" onClick={sendOtp}>Send OTP</button>}
                                                {fetchingOtp && <div className="spinner-border" role="status"></div>}
                                                {errors.email && (
                                                    <small id="emailHelp" className="form-text text-danger">
                                                        {errors.email}
                                                    </small>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {isMailSent && !isEmailVarified && (
                                        <>
                                            <div className="form-group">
                                                <p className="card-text">Step-2/3 : Verify OTP</p>
                                                <input
                                                    type="text"
                                                    name="otp"
                                                    className="form-control"
                                                    id="otp"
                                                    placeholder="Enter OTP"
                                                    value={formData.otp}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {!fetchingVarifyingOtp && <button type="button" className="btn btn-primary mt-3" onClick={verifyOtp}>Verify OTP</button>}
                                                {fetchingVarifyingOtp && <div className="spinner-border" role="status"></div>}
                                                {errors.otp && (
                                                    <small id="otpHelp" className="form-text text-danger">
                                                        {errors.otp}
                                                    </small>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {isEmailVarified &&
                                        <>
                                            <p className="card-text">Step-3/3 : Register</p>
                                            <div className="form-group mt-3">
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
                                            <div className="form-group mt-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="fullname"
                                                    id="fullname"
                                                    placeholder="Full Name"
                                                    value={formData.fullname}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {errors.fullname && (
                                                    <small id="fullnameHelp" className="form-text text-danger">
                                                        {errors.fullname}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="form-group my-2 mt-3">
                                                <select className="form-select" name="gender" onChange={handleChange} value={formData.gender} aria-label="Default select example">
                                                    <option defaultValue={'select'}>Select Gender</option>
                                                    {gender.map((rec) => (<option key={rec} value={rec}>{rec}</option>))}
                                                </select>
                                                {errors.gender && (
                                                    <small id="genderHelp" className="form-text text-danger">
                                                        {errors.gender}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="form-group mt-3 position-relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="password"
                                                    id="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span
                                                    onClick={togglePasswordVisibility}
                                                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                                {errors.password && (
                                                    <small id="passwordHelp" className="form-text text-danger">
                                                        {errors.password}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="form-group mt-3 position-relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                                {errors.confirmPassword && (
                                                    <small id="confirmPasswordHelp" className="form-text text-danger">
                                                        {errors.confirmPassword}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="mb-3 mt-3   ">

                                                <div {...getRootProps()} className="border border-dark bg-white" style={{ height: '70px' }}>
                                                    <input {...getInputProps()} />
                                                    {
                                                        isDragActive && !image ?
                                                            <p>Drop the files here ...</p> :
                                                            <p>Drag & drop a <spam className="text-primary">Profile Image</spam>, or click to select a file</p>
                                                    }
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                                    </svg>
                                                    {image && <p>Selected file {image.name}</p>}

                                                    {selectdFileError && <p style={{ color: 'red' }}>{selectdFileError}</p>}
                                                </div>
                                            </div>

                                            {!fetching && <button type="submit" disabled={!isMailSent} className="btn btn-primary mt-3">Submit</button>}
                                            {fetching && <div className="spinner-border" role="status"></div>}
                                        </>
                                    }
                                    {!isMailSent && (
                                        <div className="mt-3">
                                            If you have already an account click
                                            <Link to="/login" className="mx-1">here</Link>
                                        </div>
                                    )}
                                </form>
                            </div>

                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
}

export default Registration;