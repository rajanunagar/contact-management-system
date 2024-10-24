export const setHeader = () => {
    const token = localStorage.getItem('token');
    const header = {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    return header;
}

export const clearLocalStorage = () => {
    localStorage.removeItem('token');
}