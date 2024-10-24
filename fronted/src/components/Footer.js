import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {

    return (
        <footer className="text-center text-lg-start  text-muted m-0" style={{ backgroundColor: '#c5ecee' }}>
            <section className="">
                <div className="container text-center text-md-start">
                    <div className="row">
                        <div className="col-3 col-lg-4 col-xl-3 mx-auto mb-4 mt-3">
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-gem me-3" />
                                CMS
                            </h6>
                            <p>
                                Here you can use rows and columns to organize your footer content.
                            </p>
                        </div>
                        <div className="col-2 col-lg-2 col-xl-2 mx-auto mb-4 mt-3">
                            <h6 className="text-uppercase fw-bold mb-4">Products</h6>
                            <p>
                                <a href="#!" className="text-reset">
                                    abc
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    def
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    ghi
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    jkl
                                </a>
                            </p>
                        </div>
                        <div className="col-3 col-lg-2 col-xl-2 mx-auto mb-4 mt-3">
                            <h6 className="text-uppercase fw-bold mb-4">Useful links</h6>
                            <p>
                                <a href="#!" className="text-reset">
                                    Pricing
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    Settings
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    Orders
                                </a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">
                                    Help
                                </a>
                            </p>
                        </div>
                        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4 mt-3">
                            <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
                            <p>
                                <i className="fas fa-home me-3" /> Surat, Gujarat , INDIA
                            </p>
                            <p>
                                <i className="fas fa-envelope me-3" />
                                contact@cms.com
                            </p>
                            <p>
                                <i className="fas fa-phone me-3" /> + 01 234 567 88
                            </p>
                            <p>
                                <i className="fas fa-print me-3" /> + 01 234 567 89
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div
                className="text-center p-4"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
            >
                © 2024 Copyright:
                <Link className="text-reset fw-bold" to="/">
                    CMS
                </Link>
            </div>
        </footer>
    )
}

export default Footer