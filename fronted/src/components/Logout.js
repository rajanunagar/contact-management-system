import React, { useEffect } from 'react'
import { Navigate } from 'react-router';
import { clearLocalStorage } from '../functions/function';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { clearUser } from '../features/user/userSlice';

function Logout() {

    const dispatch = useDispatch();

    useEffect(() => {
        clearLocalStorage();
        dispatch(clearUser());
        toast.success('user loged out successfully');
    }, []);

    return (
        <Navigate to='/login'></Navigate>
    )
}

export default Logout