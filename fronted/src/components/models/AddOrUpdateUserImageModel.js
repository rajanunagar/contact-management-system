import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react';
import { toast } from "react-toastify";
import Papa from 'papaparse'
import api from "../../api/api";
import { useState } from "react";
import AddOrUpdateContactModel from "./AddOrUpdateContactModel";
import BulkImportConfirmModel from "./BulkImportConfirmModel";
import Loading from "../Loading";
import { useDropzone } from 'react-dropzone';

function AddOrUpdateUserImageModel({ open, handleAddOrUpdateUserImageModel, operation }) {

    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(false);
    const [selectdFileError, setSelectdFileError] = useState([]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': [] // Accept only image files
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

    const handleSubmit = async () => {
        if (image) {
            setError('');
            setFetching(true);
            const formData = new FormData();
            formData.append('file', image);
            try {
                const response = await api.user.fileUpload(formData);
                toast.success(response.data.message);
                handleConfirm();
            }
            catch (error) {
                toast.error(error.response.data.message)
            }
            setFetching(false);
        }
        else {
            setError('please select an image');
        }
        setImage('')
    }
    const handleClose = () => {
        handleAddOrUpdateUserImageModel(false);
    };
    const handleConfirm = async () => {
        handleAddOrUpdateUserImageModel(true);
    }

    return (
        <Modal show={open} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}  >
                <Modal.Title>{operation} Image</Modal.Title>
            </Modal.Header>
            <Modal.Body  >
                <div className="row justify-content-center  text-center mt-2">
                    <div className="col-12">
                        <div {...getRootProps()} className="border border-dark" style={{ height: '100px' }}>
                            <input {...getInputProps()} />
                            {
                                isDragActive && !image ?
                                    <p>Drop the files here ...</p> :
                                    <p>Drag & drop a profile image, or click to select a file</p>
                            }
                              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                                    </svg>
                            {image && <p>Selected file {image.name}</p>}

                            {selectdFileError && <p style={{ color: 'red' }}>{selectdFileError}</p>}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}  >
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
                    <Button variant="primary" disabled={!image} onClick={handleSubmit}>
                        {operation}
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    );
}

export default AddOrUpdateUserImageModel;