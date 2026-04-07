function Home() {
    const user = JSON.parse(sessionStorage.getItem("user"));

    return (
        <div style={{ padding: "40px" }}>
            <h1>Welcome, {user?.fname}!</h1>
            <p>Account type: {user?.accountType}</p>
        </div>
    );
}

export default Home;
