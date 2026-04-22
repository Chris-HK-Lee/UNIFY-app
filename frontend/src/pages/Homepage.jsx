import React from 'react'
import { useLocation } from 'react-router-dom'

const Homepage = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const { state } = useLocation();
    const userID = state?.userID ?? user?.userID;

    return (
        <div style={{ padding: "40px" }}>
            <h1>Welcome, {user?.fname}!</h1>
            <p>Account type: {user?.accountType}</p>
            <p>User ID: {userID}</p>
        </div>
    );
}

export default Homepage