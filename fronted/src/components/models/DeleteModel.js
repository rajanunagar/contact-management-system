import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react'
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

function DeleteModel({ _id, isDeleteModelOpen, HandleOnDelete, aboutToDelete }) {

    const [show, setShow] = useState(isDeleteModelOpen);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);

    const handleClose = () => {
        HandleOnDelete(false);
        setShow(false);
    };
    const handeleDelete = async () => {
        setFetching(true);
        if (aboutToDelete === 'contact') {
            try {
                const response = await api.contact.deleteContactById(_id);
                setSuccess(true);
                toast.success(`Contact ${response.data.fullname} deleted successfully`);
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
        if (aboutToDelete === 'user') {
            try {
                const response = await api.user.deleteUserByAdmin(_id);
                setSuccess(true);
                toast.success(`User ${response.data.fullname} deleted successfully`);

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
        if (aboutToDelete === 'yourself') {
            try {
                const response = await api.user.deleteUser();
                setSuccess(true);
                toast.success(`User ${response.data.fullname} deleted successfully`);
                navigate('/logout');
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
        setShow(false);
        HandleOnDelete(true);
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}  >
                <Modal.Title>Confimation for {aboutToDelete} deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}  >
                <p>Are you sure you want to permanently delete {aboutToDelete}?</p>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}  >
                <Button variant="secondary" onClick={handleClose}>
                    No
                </Button>
                <Button variant="danger" onClick={handeleDelete}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteModel;