import React from 'react'
import home from '../assets/images/5127314.jpg'

function About() {

    return (
        <div className="container h-100 mt-5 mb-5">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-8">
                    <div className="card" style={{ width: '100%', maxWidth: '100%', backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }} >
                        <div className="card-body">
                            <h5 className="card-title">CMS</h5>
                            <p className="card-text">
                                Contact management is the process of recording contacts' details and tracking their interactions with a business. Such systems have gradually evolved into an aspect of customer relationship management (CRM) systems, which allow businesses to improve sales and service levels leveraging a wider range of data, which allow businesses to improve sales and service levels leveraging a wider range of data.
                            </p>
                            <img className="card-img-bottom img-fluid" src={home} alt="Card image cap" style={{ maxHeight: "500px" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About