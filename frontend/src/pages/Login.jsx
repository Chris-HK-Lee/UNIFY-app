import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// login/registration code is adapted from this tutorial:
//https://www.geeksforgeeks.org/reactjs/react-hook-form-create-basic-reactjs-registration-and-login-form/


const ACCOUNT_TYPES = [
  { label: "Student",     value: "student" },
  { label: "Faculty",     value: "faculty" },
  { label: "Company Rep", value: "company" },
];

const emailPlaceholder = {
  student: "Personal Email",
  faculty: "University Email",
  company: "Business Email",
};

function Register() {
    const [accountType, setAccountType] = useState("student");
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setServerError("");
        setSuccess("");
        try {
            const res = await fetch("http://localhost:8800/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, accountType }),
            })
            const result = await res.json()
            if (!res.ok) {
                setServerError(result)
            } else {
                setSuccess(result)
            }
        } catch (err) {
            setServerError("Something went wrong. Please try again.")
        }
    }

    const handleTypeChange = (type) => {
        setAccountType(type);
        reset();
    };

    return (
        <>
            <h2>Registration Form</h2>

            <div className="type-selector">
                {ACCOUNT_TYPES.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        className={accountType === value ? "active" : ""}
                        onClick={() => handleTypeChange(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("fname", { required: true })}
                    placeholder="First Name"
                />
                {errors.fname && <span style={{ color: "red" }}>*First Name* is mandatory</span>}

                <input
                    type="text"
                    {...register("lname", { required: true })}
                    placeholder="Last Name"
                />
                {errors.lname && <span style={{ color: "red" }}>*Last Name* is mandatory</span>}

                <input
                    type="text"
                    {...register("username", { required: true })}
                    placeholder="Username"
                />
                {errors.username && <span style={{ color: "red" }}>*Username* is mandatory</span>}

                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder={emailPlaceholder[accountType]}
                />
                {errors.email && <span style={{ color: "red" }}>*Email* is mandatory</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                {serverError && <span style={{ color: "red" }}>{serverError}</span>}
                {success && <span style={{ color: "green" }}>{success}</span>}
                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>
        </>
    );
}

function Login() {
    const [accountType, setAccountType] = useState("student");
    const [serverError, setServerError] = useState("");
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setServerError("");
        try {
            const res = await fetch("http://localhost:8800/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, accountType }),
            })
            const result = await res.json()
            if (!res.ok) {
                setServerError(result)
            } else {
                sessionStorage.setItem("user", JSON.stringify(result))
                navigate("/home")
            }
        } catch (err) {
            setServerError("Something went wrong. Please try again.")
        }
    }

    return (
        <>
            <h2>Login Form</h2>

            <div className="type-selector">
                {ACCOUNT_TYPES.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        className={accountType === value ? "active" : ""}
                        onClick={() => setAccountType(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder={emailPlaceholder[accountType]}
                />
                {errors.email && <span style={{ color: "red" }}>*Email* is mandatory</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                {serverError && <span style={{ color: "red" }}>{serverError}</span>}
                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>
        </>
    );
}

function User() {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-container">
      <h1>UNI-FY</h1>
      <div className="auth-card">
      <div className="auth-tabs">
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("register")}>Register</button>
      </div>
      {mode === "login" ? <Login /> : <Register />}
      </div>
    </div>
  );
}

export default User;
