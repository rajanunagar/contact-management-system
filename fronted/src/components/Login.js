import React, { useEffect, useState } from "react";
import api from '../api/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../features/user/userSlice";

function Login() {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        email: "",
        password: ""

    });

    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.email) {
            tempErrors["email"] = "Email is required";
            isValid = false;
        }
        if (!formData.password) {
            tempErrors["password"] = "Password is required";
            isValid = false;
        } else if (formData.password.length < 4) {
            tempErrors["password"] = "Password must be at least 4 characters";
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
                setFetching(true);
                const usersRes = await api.auth.login(user);
                localStorage.setItem('token', usersRes.data.access_token);
                delete usersRes.data.access_token;
                dispatch(setUser(usersRes.data));
                toast.success('User Loged in Successfully');
                navigate('/');
                setSuccess(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {
                    console.log(error);
                }
            }
        }
        setFetching(false);
    };

    useEffect(()=>{
        if(token)
        navigate('/');
    },[token])

    return (
        <div className="container " style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}>
            <div className="row justify-content-center">
                <div className="col-lg-5">
                    <div className="card p-2" style={{ width: '100%', maxWidth: '100%', backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                        <div className="card-body px-0 mx-0">
                            <h5 className="card-title text-primary">Login</h5>
                            <hr />
                            <div className="px-3" >
                                <form onSubmit={handleSubmit} noValidate className="">
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            id="email"
                                            placeholder="Email or Username"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.email && (
                                            <small id="emailHelp" className="form-text text-danger">
                                                {errors.email}
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
                                    <div>
                                        {!fetching && <button type="submit" className="btn btn-primary mt-3">
                                            Submit
                                        </button>}
                                        {fetching && <div className="spinner-border" role="status">
                                            <span className="sr-only">  </span>
                                        </div>
                                        }
                                    </div>
                                    <div className="text-center mt-2">
                                        <Link to="/forgotpassword" className="d-block text-primary" style={{ textDecoration: 'none' }}>
                                            Forgot Password?
                                        </Link>
                                        <div className="">
                                            If you are a new user click
                                            <Link to="/register" className="mx-1 text-primary" style={{ textDecoration: 'none' }}>
                                                here
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Login;