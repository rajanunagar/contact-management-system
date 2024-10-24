import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router";
import api from '../../api/api'
import { toast } from "react-toastify";
import { FaYenSign } from "react-icons/fa";

function ChangePasswordModel({ open, handleChangePassword }) {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.password) {
            tempErrors["password"] = "Password is required";
            isValid = false;
        } else if (formData.password.length < 4) {
            tempErrors["password"] = "Password must be at least 4 characters";
            isValid = false;
        }
        if (!formData.confirmPassword) {
            tempErrors["confirmPassword"] = "Confirm password is required";
            isValid = false;
        } else if (formData.confirmPassword !== formData.password) {
            tempErrors["confirmPassword"] = "Passwords and confirm password must be same";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                setFetching(true);
                const Res = await api.user.updateUserPassword({ password: formData.password });
                toast.success('User password  has changed Successfully');
                navigate('/logout');
                setSuccess(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {

                }
                console.log(error);
            }
        }
        setFetching(false);
    };
    const handleClose = () => {
        handleChangePassword(false);
    };
    const handleConfirm = async () => {
        handleChangePassword(true);
    }

    return (
        <Modal show={open} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}>
                <form noValidate className="">
                    <div className="form-group">
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
                        {errors.password && (
                            <small id="passwordHelp" className="form-text text-danger">
                                {errors.password}
                            </small>
                        )}
                    </div>
                    <div className="form-group mt-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        {errors.confirmPassword && (
                            <small
                                id="confirmPasswordHelp"
                                className="form-text text-danger"
                            >
                                {errors.confirmPassword}
                            </small>
                        )}
                    </div>
                </form>

            </Modal.Body >
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}>
                <Button variant="secondary" onClick={handleClose}>
                    No
                </Button>

                {
                    fetching && <div className="spinner-border" role="status">
                        <span className="sr-only">  </span>
                    </div>
                }
                {
                    !fetching &&
                    <Button variant="primary" onClick={handleSubmit}>
                        Change
                    </Button>
                }
            </Modal.Footer>
        </Modal >
    );
}

export default ChangePasswordModel;