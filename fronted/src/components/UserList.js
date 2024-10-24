import React from 'react'
import { useEffect, useState } from 'react';
import api from '../api/api';
import Loading from './Loading';
import DeleteModel from './models/DeleteModel';
import { Pagination } from 'react-bootstrap';
import UpdateUserModel from './models/UpdateUserModel';
import emptyProfie from '../assets/images/emptyProfile.png';

function UserList() {

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [contactsPerPage] = useState(10);
    const [isListCalled, setIsListCalled] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
    const [isUpdateModelOpen, setIsUpdateModelOpen] = useState(false);
    const [_id, setId] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const paginate = (pageNumber) => {
        if (pageNumber <= Math.ceil(totalRecords / contactsPerPage) && pageNumber !== 0)
            setCurrentPage(pageNumber)
    };
    const getUsers = async () => {
        try {
            setFetching(true);
            setSuccess(false);
            setError(false);
            const userRes = await api.user.getAllUsers(currentPage, contactsPerPage, searchInput);
            setSuccess(true);
            setUsers(userRes.data.users);
            setTotalRecords(userRes.data.length);
        } catch (err) {
            setError(err.response.data.message);
        }
        setFetching(false);
    };
    function HandleOnDeleteUser(value) {
        setIsDeleteModelOpen(false);
        if (value) {
            getUsers();
        }
    };
    function onDeleteUser(id) {
        setId(id);
        setIsDeleteModelOpen(true);
    };
    function HandleOnUpdateUser(value) {
        setIsUpdateModelOpen(false);
        if (value) {
            getUsers();
        }
    };
    function onUpdateUser(id) {
        setId(id);
        setIsUpdateModelOpen(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            if (isListCalled) {
                getUsers();
            }
            else {
                setIsListCalled(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchInput])
    useEffect(() => {
        getUsers();
    }, [currentPage]);

    return (

        <div className="my-5">
            <p>{isDeleteModelOpen}</p>
            {isDeleteModelOpen &&
                <DeleteModel _id={_id} aboutToDelete='user' isDeleteModelOpen={isDeleteModelOpen} HandleOnDelete={HandleOnDeleteUser} />
            }
            {
                isUpdateModelOpen && <UpdateUserModel userId={_id} isModelOpen={isUpdateModelOpen} handleUpdateUser={HandleOnUpdateUser} />
            }
            {
                !fetching && <div className="container mt-3">
                    <div className="row justify-content-center">
                        <div className="col-lg-10" >
                            <div className="card rounded-2 p-3" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                                <div className="card-body  px-0 mx-0">
                                    <h5 className="card-title text-primary" >User List</h5>
                                    <div className="container mt-3 g-0">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group has-search">
                                                    <span className="form-control-feedback">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                                        </svg>
                                                    </span>
                                                    <input type="text" className="form-control" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by Full Name" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive  mt-3">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    {/* <th>Index</th> */}
                                                    <th>Image</th>
                                                    <th>Full Name</th>
                                                    <th>Email</th>
                                                    <th>Username</th>
                                                    <th>Gender</th>
                                                    <th>Contact Count</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            {success && users.length > 0 && (<tbody>
                                                {users.map((user, index) => (
                                                    <tr key={user._id}>
                                                        {/* <td>{index + 1 + (currentPage - 1) * 10}</td> */}
                                                        <td>
                                                            <div className="d-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>

                                                                {user.image && <img
                                                                    src={`http://localhost:5001/Images/${user.image}`}
                                                                    alt="..."
                                                                    className='img-fluid'
                                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                                                />
                                                                }
                                                                {
                                                                    !user.image && <img src={emptyProfie} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} className='img-fluid' />
                                                                }
                                                            </div>
                                                        </td>
                                                        <td>{user.fullname}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.gender}</td>
                                                        <td>{user.contactCount}</td>
                                                        <td>
                                                            <button onClick={() => onUpdateUser(user._id)} className='btn card-link'><svg
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
                                                            </button>
                                                            <button onClick={() => onDeleteUser(user._id)} className='btn card-link'><svg
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
                                            )

                                            }
                                        </table>
                                        {
                                            success && <div className="container mt-3">

                                                <div className="row justify-content-center mx-auto">
                                                    <div className='col-auto'>
                                                        <Pagination>
                                                            <Pagination.First onClick={() => paginate(1)} />
                                                            <Pagination.Prev onClick={() => paginate(currentPage - 1)} />
                                                            {Array.from({ length: Math.ceil(totalRecords / contactsPerPage) }, (_, i) => (
                                                                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                                                    {i + 1}
                                                                </Pagination.Item>
                                                            ))}
                                                            <Pagination.Next onClick={() => paginate(currentPage + 1)} />
                                                            <Pagination.Last onClick={() => paginate(Math.ceil(totalRecords / contactsPerPage))} />
                                                        </Pagination>
                                                    </div>
                                                </div></div>
                                        }
                                        {success && users.length === 0 && <p>CMS Don't Have any User</p>}
                                        {error && <p>{error}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            }
            {fetching && <Loading />}
        </div >
    );
}

export default UserList;