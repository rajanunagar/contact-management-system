import { Outlet, useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import api from '../api/api';
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { clearLocalStorage } from "../functions/function";
import download from '../assets/images/download.jpeg';
import Footer from "./Footer";
import { useSelector } from "react-redux";
// import ReactSwitch from "react-switch";
// import { ThemeContext } from "../App";

function Header() {

    // const use = useContext(ThemeContext);
    const { username } = useSelector((store) => store.user.userInfo);
    const navigate = useNavigate();
    const location = useLocation();
    const [path, setPath] = useState('');
    const user = useSelector((store) => store.user.userInfo);

    const validateToken = async () => {
        try {
            const response = await api.auth.tokenValid();
        }
        catch (error) {
            navigate('/login');
        }
    }

    useEffect(() => {
        setPath(location.pathname);
    }, [location.pathname])
    useEffect(() => {
        validateToken();
    }, [path]);
    useEffect(() => {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error?.response?.status === 401 || error?.status === 401) {
                    clearLocalStorage();
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );
    }, [])

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#c5ecee' }}>
                <div className="container-fluid">
                    <NavLink className="navbar-brand nav-item d-none d-lg-block" to='/'>
                        <div className="logo-image">
                            <img src={download} className="img-fluid" alt="Logo" />
                        </div>
                    </NavLink>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link active" aria-current="page" to='/'>Home</NavLink>
                            </li>
                            {user?.isAdmin &&
                                <li className="nav-item">
                                    <NavLink className="nav-link" to='/user'>Users</NavLink>
                                </li>
                            }
                            {user && !user?.isAdmin &&
                                <li className="nav-item">
                                    <NavLink className="nav-link" to='/contact'>Contacts</NavLink>
                                </li>
                            }
                            <li className="nav-item">
                                <NavLink className="nav-link" to='/About'>About</NavLink>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 mx-md-5">
                            <li className="nav-item dropdown">
                                <NavLink className="nav-link dropdown-toggle" to='/' id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Hi, {username}
                                </NavLink>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><NavLink className="dropdown-item" to='/profile'>Profile</NavLink></li>
                                    {/* <li><hr className="dropdown-divider" /></li> */}
                                    <li><NavLink className="dropdown-item" to='/logout'>Logout</NavLink></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div style={{minHeight:'72vh',
              }}>
            <Outlet />
            </div>
            <Footer />
        </>

    );
}

export default Header;