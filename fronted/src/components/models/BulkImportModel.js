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

function BulkImportModel({ open, handleBulkImport }) {

    const [file, setFile] = useState();
    const [array, setArray] = useState([]);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isBulkImportModelOpen, setIsBulkImportModelOpen] = useState(false);
    const [isAddModelOpen, setIsAddModelOpen] = useState(false);
    const [index, setIndex] = useState(-1);
    const [addedRecord, setAdddRecord] = useState(0);
    const [isContactImported, setIsContactImported] = useState(false);
    const [contact, setContact] = useState({
        phoneno: "",
        fullname: "",
        phonecategory: "Phone",
        code: "",
    });
    const [selectdFileError, setSelectdFileError] = useState([]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setSelectdFileError('');
            setFile(acceptedFiles[0]);
            setArray([]);
            setSuccess(false);
            setIsContactImported(false);
        },
        onDropRejected: (rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                const errorType = rejectedFiles[0].errors[0].code;
                let errorMessage;
                console.log(errorType);
                if (errorType === 'file-invalid-type') {
                    errorMessage = 'Please select an CSV file.';
                } else if (errorType == 'too-many-files') {
                    errorMessage = 'Only one CSV can be selected at a time.';
                } else {
                    errorMessage = 'An error occurred.';
                }
                setSelectdFileError(errorMessage);
            }
            else
                setSelectdFileError('An error occurred.');
        }
    });
    const row = ["fullname", "phonecategory", "code", "phoneno"];

    const handleClose = () => {
        handleBulkImport(false);
    };
    const handleConfirm = async () => {
        handleBulkImport(true);
    }
    const handleOnSubmit = (e) => {
        e.preventDefault();
        if (file) {
            setFetching(true);
            Papa.parse(file, {
                complete: (result) => {
                    setSuccess(true);
                    setArray(result.data.map((rec) => {
                        let obj = {};
                        obj.code = rec.code ? rec.code.toString() : '';
                        obj.phoneno = rec.phoneno ? rec.phoneno.toString() : '';
                        obj.fullname = rec.fullname ? rec.fullname.toString() : '';
                        obj.phonecategory = rec.phonecategory ? rec.phonecategory.toString() : '';
                        return obj;
                    }))
                },
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
            });
            setFetching(false);
        };
    }
    const handleSubmit = async (e) => {
        try {
            setSuccess(false);
            setFetching(true);
            setIsContactImported(false);
            const contactRes = await api.contact.bulkImportContactByUsrId(array);
            toast.success('Contact Bulk Import Successfully');
            setArray(contactRes.data.data);
            setAdddRecord(contactRes.data.success);
            setFile(null);
            setSuccess(true);
            setIsContactImported(true);
        } catch (err) {
            setError(true);
            if (err.response.data.message) {
                toast.error(err.response.data.message);
            }
            else {
            }
            console.log(error);
        }
        setFetching(false);
    };
    const handleBulkImportConfirmation = (value) => {
        if (value) {
            handleSubmit();
        }
        setIsBulkImportModelOpen(false);

    }
    const onModifyContact = (value, index) => {
        setContact(value);
        setIndex(index);
        setIsAddModelOpen(true);
    }
    function HandleOnAddContact(value) {
        setIsAddModelOpen(false);
        if (value) {
            setContact({});
        }
    };
    const downloadSample = () => {
        downloadCSV([row], 'sample.csv');
    }
    const downloadCSV = (data, filename) => {
        const csvContent = data.map(row =>
            row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal show={open} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName="modal-90w"
            backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}    >
                <Modal.Title>Contact Bulk Import</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="container my-5">
                    <BulkImportConfirmModel open={isBulkImportModelOpen} handleBulkImport={handleBulkImportConfirmation} />
                    {
                        isAddModelOpen && <AddOrUpdateContactModel contactId='' contact={contact} isAddOrUpdateModelOpen={isAddModelOpen} HandleOnAddOrUpdateContact={HandleOnAddContact} fromImport={true} setArray={setArray} index={index} setAdddRecord={setAdddRecord} />
                    }
                    <div className="row justify-content-center  align-items-center text-center">

                        <div className="mb-3 col-auto">

                            <dl class="row">
                                <dt class="col-sm-3">Full Name</dt>
                                <dd class="col-sm-9">Can not be empty and must have minimum 4 character</dd>
                                <dt class="col-sm-3">Phone Category</dt>
                                <dd class="col-sm-9"> Must be from Landline, Phone, Emergency</dd>
                                <dt class="col-sm-3">Code</dt>
                                <dd class="col-sm-9">Emergency number don't have code.</dd>
                                <dt class="col-sm-3">Phone No</dt>
                                <dd class="col-sm-9"> Can not be empty and contains only digit and hyphen </dd>
                            </dl>
                            <button type="button" className='btn btn-primary px-4' onClick={downloadSample}>
                                <spam className="px-1">Preview</spam>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-down" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1z" />
                                    <path fillRule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708z" />
                                </svg>
                            </button>
                        </div>
                        <div className="col-12">
                            <div {...getRootProps()} className="border" style={{ height: '100px' }}>
                                <input {...getInputProps()} />
                                {
                                    isDragActive && !file ?
                                        <p>Drop the files here ...</p> :
                                        <p>Drag & drop a file here, or click to select a file</p>
                                }
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                </svg>
                                {file && <p>Selectd file {file.name}</p>}

                                {selectdFileError && <p style={{ color: 'red' }}>{selectdFileError}</p>}
                            </div>
                            <button type="button" disabled={!file} className="btn btn-secondary mt-3"
                                onClick={(e) => {
                                    handleOnSubmit(e);
                                }}
                            >
                                Get Contacts
                            </button>
                        </div>
                    </div>
                    <div className="row justify-content-center text-center">
                        <div className="col-12 mt-5" >
                            {success && <div className="card rounded-2 p-2" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                                <div className="card-body  px-0 mx-0">
                                    <h5 className="card-title text-primary mb-2" >Selected File Contain below Contacts and Status</h5>
                                    {
                                        isContactImported && <p>{addedRecord}/{array?.length} record added successfully.</p>
                                    }
                                    <hr />
                                    {array.length > 0 &&
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr key={"header"}>
                                                        <th>Index</th>
                                                        <th>Full Name</th>
                                                        <th>Phone Category</th>
                                                        <th>Code</th>
                                                        <th>Phone No</th>
                                                        <th>Status</th>
                                                        <th>Modify</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {success && array.map((contact, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{contact.fullname}</td>
                                                            <td>{contact.phonecategory}</td>
                                                            <td>{contact.code != '' ? contact.code : '-'}</td>
                                                            <td>{contact.phoneno}</td>
                                                            <td className={contact.status == undefined ? 'text-warning' : contact.status === 'success' ? 'text-success' : 'text-danger'}>{contact.status ? contact.status : 'pending'}</td>
                                                            <td><button disabled={!contact.status || contact.status == 'success'} className="btn card-link" onClick={() => onModifyContact(contact, index)}><svg
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
                                                            </svg>
                                                            </button></td>
                                                        </tr>
                                                    )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    }
                                    {!fetching && array.length === 0 && <p className="">Selected CSV file don't have any contact</p>}
                                    {/* {array.length > 0 && <div className="mt-4"><button className="btn btn-primary" disabled={!(success && array.length > 0 && file)} onClick={(e) => setIsBulkImportModelOpen(true)}>Import</button></div>
                                    } */}
                                </div>
                            </div>
                            }
                        </div>
                        {fetching && <tr><Loading /></tr>}
                    </div>
                </div >
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}    >
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={!(success && array.length > 0 && file)} onClick={(e) => setIsBulkImportModelOpen(true)}>
                    Import
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default BulkImportModel;