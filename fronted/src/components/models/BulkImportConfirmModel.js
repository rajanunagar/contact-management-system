import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react';

function BulkImportConfirmModel({ open, handleBulkImport }) {

    const handleClose = () => {
        handleBulkImport(false);
    };
    const handleConfirm = async () => {
        handleBulkImport(true);
    }

    return (
        <Modal show={open} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}  >
                <Modal.Title>Confimation For Contact Bulk Import</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}  >
                <p>Are you sure you want to Bulk Import Contact ?</p>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}  >
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default BulkImportConfirmModel;