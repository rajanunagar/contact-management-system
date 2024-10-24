import React from 'react'
import home from '../assets/images/5127314.jpg';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

function Home() {

    const navigate = useNavigate();
    const { isAdmin } = useSelector((store) => store.user.userInfo);

    return (
        // <div className="container h-100 mt-4">
        //     <div className="row d-flex justify-content-center align-items-center">
        //         <div className="col-12 col-md-8">
        //             <div className="card border-0">
        //                 <div className="card-body">
        //                     <h5 className="card-title">Contact Management System</h5>
        //                     <p className="card-text">
        //                         CMS is the process of storing and managing your  contacts.
        //                     </p>
        //                     {!isAdmin &&
        //                         <button onClick={() => navigate('/contact')} className='btn btn-primary card-link'>Manage Contact</button>
        //                     }
        //                     {isAdmin &&
        //                         <button onClick={() => navigate('/user')} className='btn btn-primary card-link'>Manage User</button>
        //                     }
        //                 </div>
        //                 <img className="card-img-bottom img-fluid" src={home} alt="Card image cap" style={{ maxHeight: "650px" }} />
        //             </div>
        //         </div>
        //     </div>
        // </div>
        <div className="container h-100 mt-5 mb-5">
            <div className="row d-flex justify-content-center align-items-center">
                <div className='col-12 col-md-6' >
                    <div className="card border-0">
                        <div className="card-body">
                            <h5 className="card-title">Contact Management System</h5>
                            <p className="card-text">
                                CMS is the process of storing and managing your  contacts.
                            </p>
                            {!isAdmin &&
                                <button onClick={() => navigate('/contact')} className='btn btn-primary card-link'>Manage Contact</button>
                            }
                            {isAdmin &&
                                <button onClick={() => navigate('/user')} className='btn btn-primary card-link'>Manage User</button>
                            }
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <img className="card-img-bottom img-fluid" src={home} alt="Card image cap" style={{ maxHeight: "650px" }} />

                </div>
            </div>
        </div>
    )
}

export default Home