import React, { useState } from "react";
import api from '../api/api';
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

function ForgotPassword() {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [email, setEmail] = useState('');
    const [isMailSent, setIsMailSent] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (!email) {
            tempErrors["email"] = "Email is required";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                setIsMailSent(false);
                setFetching(true);
                const usersRes = await api.auth.mailForgotPasswordLink({ email: email });
                toast.success(`Reset Password link sent to Your Mail ${usersRes.data.email} Successfully`);
                setIsMailSent(true);
                setSuccess(true);
                navigate('/');
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {
                    console.log(error);
                }
                setIsMailSent(false);
            }
        }
        setFetching(false);
    };

    return (
        <div className="container" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}>
            <div className="row  justify-content-center">
                <div className="col-md-5">
                    <div className="card p-2" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                        <div className="card-body  px-0 mx-0">
                            <h5 className="card-title text-primary" >Forgot Password</h5>
                            <hr />
                            <div className="px-3" >
                                <form onSubmit={handleSubmit} noValidate className="">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="email"
                                            className="form-control"
                                            id="email"
                                            placeholder="Enter email or Username"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setIsMailSent(false) }}
                                            required
                                        />
                                        {errors.email && (
                                            <small id="emailHelp" className="form-text text-danger">
                                                {errors.email}
                                            </small>
                                        )}
                                    </div>
                                    {!fetching && <button type="submit" disabled={isMailSent} className="btn btn-primary mt-3">
                                        Submit
                                    </button>
                                    }
                                    {
                                        fetching && <div className="spinner-border" role="status">
                                            <span className="sr-only">  </span>
                                        </div>
                                    }
                                    <div className="mt-2">
                                        <Link to="/login" >
                                            Login
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;