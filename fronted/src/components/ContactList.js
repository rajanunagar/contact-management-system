import React from 'react'
import { useEffect, useState } from 'react';
import api from '../api/api';
import Loading from './Loading';
import { useNavigate } from 'react-router';
import DeleteModel from './models/DeleteModel';
import { Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AddOrUpdateContactModel from './models/AddOrUpdateContactModel';
import BulkImportModel from './models/BulkImportModel';

function ContactList() {

    const [contacts, setContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [contactsPerPage] = useState(10);
    const [isContactFetching, setIsContactFetching] = useState(false);
    const [isListCalled, setIsListCalled] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
    const [isAddOrUpdateModelOpen, setIsAddOrUpdateModelOpen] = useState(false);
    const [isBulkImportModelOpen, setIsBulkImportModelOpen] = useState(false);
    const [_id, setId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();
    const row = ["fullname", "phonecategory", "code", "phoneno"];

    const paginate = (pageNumber) => {
        if (pageNumber <= Math.ceil(totalRecords / contactsPerPage) && pageNumber !== 0)
            setCurrentPage(pageNumber)
    };
    const getContacts = async () => {
        try {
            setFetching(true);
            setSuccess(false);
            setError(false);
            const contactsRes = await api.contact.getContactByUserId(currentPage, contactsPerPage, searchInput);
            setSuccess(true);
            setContacts(contactsRes.data.contacts);
            setTotalRecords(contactsRes.data.length);
        } catch (err) {
            setError(err.response.data.message);
        }
        setFetching(false);
    };
    function HandleOnDeleteContact(value) {
        setIsDeleteModelOpen(false);
        setId('');
        if (value) {
            getContacts();
        }
    };
    function onDeleteContact(id) {
        setId(id);
        setIsDeleteModelOpen(true);
    };

    function onUpdateContact(id) {
        setId(id);
        setIsAddOrUpdateModelOpen(true);
    }
    function HandleOnAddOrUpdateContact(value) {
        setIsAddOrUpdateModelOpen(false);
        setId('');
        if (value) {
            getContacts();
        }
    };
    const getAllContacts = async () => {
        try {
            setIsContactFetching(true);
            const contactsRes = await api.contact.getContactByUserId(-1);
            const csvData = [
                row,
                ...contactsRes.data.contacts.map(({ fullname, phonecategory, code, phoneno }) => [
                    fullname,
                    phonecategory,
                    code,
                    phoneno,
                ])
            ];
            downloadCSV(csvData, 'contacts.csv');
        } catch (err) {
            // setError(true);
            toast.error(err.response.data.message);
        }
        setIsContactFetching(false);
    };
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
    const contactModel = {
        phoneno: "",
        fullname: "",
        phonecategory: "Phone",
        code: "",
    };
    const handleBulkImport = () => {
        setIsBulkImportModelOpen(false);
        getContacts();
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            if (isListCalled) {
                getContacts();
            }
            else {
                setIsListCalled(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchInput])
    useEffect(() => {
        getContacts();
    }, [currentPage]);

    return (
        <div className="my-4">
            <p>{isDeleteModelOpen}</p>
            {isDeleteModelOpen &&
                <DeleteModel _id={_id} aboutToDelete='contact' isDeleteModelOpen={isDeleteModelOpen} HandleOnDelete={HandleOnDeleteContact} />
            }
            {isAddOrUpdateModelOpen &&
                <AddOrUpdateContactModel contactId={_id} contact={contactModel} isAddOrUpdateModelOpen={isAddOrUpdateModelOpen} HandleOnAddOrUpdateContact={HandleOnAddOrUpdateContact} />
            }
            {
                isBulkImportModelOpen &&
                <BulkImportModel open={isBulkImportModelOpen} handleBulkImport={handleBulkImport} />
            }

            {!fetching && <div className="container mt-3">

                <div className="row justify-content-center">
                    <div className="col-lg-9" >
                        <div className="card mx-auto rounded-2 p-3" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                            <div className="card-body  px-0 mx-0">
                                <h5 className="card-title " >Contact List</h5>
                                <div className="container mt-3">
                                    <div className="row align-items-center">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <div className="form-group has-search">
                                                <span className="form-control-feedback">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                                    </svg>
                                                </span>
                                                <input type="text" className="form-control" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by Full Name" />
                                            </div>
                                        </div>
                                        <div className="col-md-8 d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-end gap-2">
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                <button type="button" className='btn btn-primary px-4' onClick={(e) => { onUpdateContact('') }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-person-plus-fill" viewBox="0 0 16 16">
                                                        <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                                                        <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" />
                                                    </svg>
                                                </button>
                                                <button type="button" className='btn btn-primary px-4' onClick={(e) => setIsBulkImportModelOpen(true)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-upload-fill" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0" />
                                                    </svg>
                                                </button>
                                                {
                                                    !isContactFetching && <button type="button" className='btn btn-primary px-4' onClick={getAllContacts}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-box-arrow-down" viewBox="0 0 16 16">
                                                            <path fillRule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1z" />
                                                            <path fillRule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708z" />
                                                        </svg>
                                                    </button>
                                                }
                                                {
                                                    isContactFetching && <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {success && contacts.length > 0 &&
                                    <div className="table-responsive mt-3" >
                                        <table className="table table-hover" >
                                            <thead>
                                                <tr>
                                                    <th>Index</th>
                                                    <th>Full Name</th>
                                                    <th>Phone Category</th>
                                                    <th>Code</th>
                                                    <th>Phone No</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contacts.map((contact, index) => (
                                                    <tr key={contact._id}>
                                                        <td>{index + 1 + (currentPage - 1) * 10}</td>
                                                        <td>{contact.fullname}</td>
                                                        <td>{contact.phonecategory}</td>
                                                        <td>{contact.code ? `+${contact.code}` : '-'}</td>
                                                        <td>{contact.phoneno}</td>
                                                        <td>
                                                            <button className="btn card-link" onClick={() => onUpdateContact(contact._id)}><svg
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
                                                            </svg></button>
                                                            <button className="btn card-link" onClick={() => onDeleteContact(contact._id)}><svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="bi bi-trash3-fill"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                            </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                    </div>
                                }
                                {
                                    success && contacts.length > 0 && <div className="container mt-3">

                                        <div className="row justify-content-center mx-auto">
                                            <div className='col-auto'><Pagination>
                                                <Pagination.First onClick={() => paginate(1)} />
                                                <Pagination.Prev onClick={() => paginate(currentPage - 1)} />
                                                {Array.from({ length: Math.ceil(totalRecords / contactsPerPage) }, (_, i) => (
                                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                                        {i + 1}
                                                    </Pagination.Item>
                                                ))}
                                                <Pagination.Next onClick={() => paginate(currentPage + 1)} />
                                                <Pagination.Last onClick={() => paginate(Math.ceil(totalRecords / contactsPerPage))} />
                                            </Pagination></div>

                                        </div>
                                    </div>
                                }
                                {success && contacts.length === 0 && <p className='mt-4'>User Don't Have any Contact</p>}
                                {
                                    error && <p className='mt-4'>{error}</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            }
            {/* {error && <p>Error</p>} */}
            {fetching && <Loading />}
        </div >
    );
}

export default ContactList;