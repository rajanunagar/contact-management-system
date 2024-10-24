import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react'
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Loading from "../Loading";

function UpdateUserModel({ userId, isModelOpen, handleUpdateUser }) {

    const [show, setShow] = useState(isModelOpen);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({});
    const gender = ['Male', 'Female', 'Other'];
    const [errors, setErrors] = useState({});

    const handleClose = () => {
        handleUpdateUser(false);
        setShow(false);
    };
    const getUser = async () => {
        try {
            setFetching(true);
            const userRes = await api.user.getUserById(userId);
            setSuccess(true);
            let { fullname, gender } = userRes.data;
            setFormData({ fullname: fullname, gender: gender });
        } catch (err) {
            setError(true);
            toast.error(err.response.data.message);
            navigate('/user');
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
            try {
                setIsProcessing(true)
                const userRes = await api.user.updateUserbyAdmin(userId, formData);
                toast.success('User Updated Successfully');
                setSuccess(true);
                setShow(false);
                handleUpdateUser(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {
                    console.log(err);
                }
            }
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (userId)
            getUser();
        else {
            setSuccess(true)
        }
    }, []);

    return (
        <Modal show={show} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}>
                <Modal.Title> Update User</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}>
                {success && <form noValidate className="my-3">
                    <div className="form-group">
                        <label htmlFor="fullname">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            className="form-control"
                            id="fullname"
                            placeholder="fullname"
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
                </form>
                }
                {
                    fetching && <Loading />
                }
                {/* {
                error && <p>Error</p>
            } */}

            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}>
                <Button variant="secondary" onClick={handleClose}>
                    No
                </Button>
                {
                    isProcessing && <div className="spinner-border" role="status">
                        <span className="sr-only">  </span>
                    </div>
                }
                {
                    !isProcessing &&
                    <Button variant="primary" onClick={handleSubmit}>
                        Update
                    </Button>
                }
            </Modal.Footer>
        </Modal >
    );
}

export default UpdateUserModel;