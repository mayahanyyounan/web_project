import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Register =() => {
 const [username , setUsername] = useState("");
 const[ email, setEmail] = useState("");
 const [ password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [showPassword, setShowPassword]= useState(false);
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate(); // redirect the user to login page
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);
     try {
        await api.post("/auth/register", {
            username,
            email,
            password
        });
        navigate("/login");
    } catch (error) {
       setError(
        error.response?.data?.message || "Registration failed"
    );
    }
    finally {
    setLoading(false);
    }
};
    return (
        <div>
            <h1> Sign Up</h1>
            <h4> create your reddit account</h4>
            <form onSubmit={handleRegister}> 

            <input
              type= "text"
              placeholder= "Username"
              value= {username}
              onChange= {(e) => setUsername(e.target.value)}
              required
            />

            <input
              type= "email"
              placeholder= "Email"
              value= {email}
              onChange= {(e) => setEmail (e.target.value)}
              required
            />
            <div>
            <input
              type= { showPassword ? "text" : "password"}
              placeholder= "Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type= "button"
            onClick= {() => setShowPassword(!showPassword)}
            aria-label={ showPassword ? "Hide password" : "show password"}
            >
                {showPassword ? <EyeOff /> : <Eye /> }
            </button>
            </div>
            {error && <p>{error}</p>}
            <button type="submit" disabled={loading}>
               {loading ? "Creating account..." : "Sign Up"}
            </button>

            </form>
            <p>
            Already have an account?
            <Link to="/login">Log In</Link>
            </p>
        </div>
    );
};



export default Register;