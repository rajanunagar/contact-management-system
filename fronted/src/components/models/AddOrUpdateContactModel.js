import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react'
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Loading from "../Loading";

function AddOrUpdateContactModel({ contactId, isAddOrUpdateModelOpen, HandleOnAddOrUpdateContact, contact, fromImport, setArray, index, setAdddRecord }) {

    const operation = contactId ? 'Update' : 'Add';
    const [show, setShow] = useState(isAddOrUpdateModelOpen);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState(contact);
    const [errors, setErrors] = useState({});
    const phonecategory = ['Landline', 'Emergency'];
    const CountryCode = [
        { name: 'India', code: '91' },
        { name: 'Australia', code: '61' },
        { name: 'United States', code: '1' },
        { name: 'United Kingdom', code: '44' },
        { name: 'Pakistan', code: '92' },
        { name: 'South Africa', code: '27' },
        { name: 'China', code: '86' },
        { name: 'Sri Lanka', code: '94' },
        { name: 'Japan', code: '81' },
        { name: 'Germany', code: '49' },
        { name: 'France', code: '33' },
        { name: 'Italy', code: '39' },
        { name: 'Brazil', code: '55' },
        { name: 'Mexico', code: '52' },
        { name: 'Russia', code: '7' },
        { name: 'New Zealand', code: '64' },
        { name: 'South Korea', code: '82' },
        { name: 'Singapore', code: '65' },
        { name: 'Thailand', code: '66' },
        { name: 'Turkey', code: '90' },
        { name: 'Saudi Arabia', code: '966' },
        { name: 'United Arab Emirates', code: '971' },
        { name: 'Indonesia', code: '62' },
        { name: 'Malaysia', code: '60' },
        { name: 'Philippines', code: '63' },
        { name: 'Vietnam', code: '84' },
        { name: 'Egypt', code: '20' },
        { name: 'Nigeria', code: '234' },
        { name: 'Kenya', code: '254' },
        { name: 'Colombia', code: '57' },
        { name: 'Argentina', code: '54' },
        { name: 'Chile', code: '56' },
        { name: 'Peru', code: '51' }
    ];


    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const handleChangePhoneCategory = (e) => {
        if (e.target.value === 'Emergency') {
            formData.code = '';
        }
        handleChange(e);
    }
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.fullname) {
            tempErrors["fullname"] = "fullname is required";
            isValid = false;
        } else if (formData.fullname?.length < 4 || formData.fullname?.length > 50) {
            tempErrors["fullname"] = "fullname must between 4 to 50 character";
            isValid = false;
        }
        if (!formData.phoneno) {
            tempErrors["phoneno"] = "phoneno is required";
            isValid = false;
        } else if (formData.password?.length > 50) {
            tempErrors["phoneno"] = "phoneno must be less than or equal to 50 character";
            isValid = false;
        }
        if (formData.phonecategory !== 'Emergency' && formData.code?.length === 0) {
            tempErrors["code"] = "code can not be empty";
            isValid = false;
        }
        if (formData.code?.length > 3) {
            tempErrors["code"] = "code must be less than or Equal to 3 character";
            isValid = false;
        }
        if (formData.phonecategory !== 'Emergency' && !formData.code) {
            tempErrors["code"] = "code is required field";
            isValid = false;
        }
        if (!formData.phonecategory) {
            tempErrors["phonecategory"] = "phonecategory is required";
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
                delete formData.status;
                let contactRes;
                if (contactId) {
                    contactRes = await api.contact.updateContactById(contactId, formData);
                }
                else {
                    contactRes = await api.contact.addContactByUserId(formData);
                }
                toast.success(`Contact ${contactId ? 'updated' : "added"} Successfully`);
                if (fromImport) {
                    formData.status = 'success';
                    setArray((arr) => {
                        arr[index] = formData;
                        return arr;
                    })
                    setAdddRecord((c) => c + 1)
                }
                setSuccess(true);
                setShow(false);
                HandleOnAddOrUpdateContact(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    if (fromImport) {
                        formData.status = err.response.data.message
                        setArray((arr) => {
                            arr[index] = formData;
                            return arr;
                        })
                    }
                    toast.error(err.response.data.message);
                    if (fromImport) {
                        handleClose();
                    }
                }
                else {
                    console.log(err);
                }
            }
            setIsProcessing(false);
        }
    };
    const getContact = async () => {
        try {
            setFetching(true);
            const contactRes = await api.contact.getContactById(contactId);
            setSuccess(true);
            let { fullname, phoneno, phonecategory, code } = contactRes.data;
            setFormData({ fullname: fullname, phoneno: phoneno, phonecategory: phonecategory, code: code });
        } catch (err) {
            setError(true);
            toast.error(err.response.data.message);
            navigate('/contact');
        }
        setFetching(false);
    };
    const handleClose = () => {
        HandleOnAddOrUpdateContact(false);
        setShow(false);
    };

    useEffect(() => {
        if (contactId)
            getContact();
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
                <Modal.Title> {operation} Contact</Modal.Title>
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
                    <div className="form-group my-2">
                        <label htmlFor="phonecategory">Phone Category</label>
                        <select className="form-select" name="phonecategory" onChange={handleChangePhoneCategory} value={formData.phonecategory} aria-label="Default select example">
                            <option defaultValue='Phone'>Phone</option>
                            {
                                phonecategory.map((rec, index) => (<option key={index} value={rec}>{rec}</option>))
                            }
                        </select>
                        {errors.phonecategory && (
                            <small
                                id="phonecategoryHelp"
                                className="form-text text-danger"
                            >
                                {errors.phonecategory}
                            </small>
                        )}
                    </div>
                    {formData.phonecategory !== 'Emergency' && <div className="form-group">
                        <div className="form-group my-2" >
                            <label htmlFor="code">Code</label>
                            <select className="form-select" name="code" onChange={handleChange} value={formData.code} aria-label="Default select example">
                                <option value='' >Select Code</option>
                                {
                                    CountryCode.map((rec) => (<option key={rec.code} value={rec.code}>{'+' + rec.code + ' ' + rec.name}</option>))
                                }
                            </select>
                            {errors.code && (
                                <small
                                    id="codeHelp"
                                    className="form-text text-danger"
                                >
                                    {errors.code}
                                </small>
                            )}
                        </div>
                    </div>
                    }
                    <div className="form-group">
                        <label htmlFor="phoneno">Phone No</label>
                        <input
                            type="text"
                            className="form-control"
                            name="phoneno"
                            id="phoneno"
                            placeholder="Phone No"
                            value={formData.phoneno}
                            onChange={handleChange}
                            required
                        />
                        {errors.phoneno && (
                            <small
                                id="phonenoHelp"
                                className="form-text text-danger"
                            >
                                {errors.phoneno}
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
                        {operation}
                    </Button>
                }
            </Modal.Footer>
        </Modal >
    );
}

export default AddOrUpdateContactModel;