import React, { useState } from "react";
import "./styles.css";
import { postModel } from "../../lib/fetchModelData";

/**
 * Component LoginRegister - Quản lý chức năng Đăng nhập và Đăng ký.
 * Sử dụng HTML thuần kết hợp CSS đơn giản để người học dễ đọc hiểu.
 * Có trạng thái toggled giữa Login và Register giúp giao diện cực kỳ tối giản.
 */
function LoginRegister({ onLogin }) {
  // --- CHẾ ĐỘ XEM (ĐĂNG NHẬP HOẶC ĐĂNG KÝ) ---
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // --- STATE CHO ĐĂNG NHẬP ---
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- STATE CHO ĐĂNG KÝ ---
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");
  
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Hàm xử lý Đăng nhập
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang
    setLoginError("");

    if (!loginName.trim()) {
      setLoginError("Please enter your login name.");
      return;
    }

    postModel("/admin/login", {
      login_name: loginName,
      password: loginPassword,
    })
      .then((response) => {
        // Lưu token JWT vào localStorage để các request sau tự lấy ra dùng
        localStorage.setItem("token", response.data.token);
        // Báo cho component cha App.js biết user đã đăng nhập thành công
        onLogin(response.data);
      })
      .catch((err) => {
        setLoginError(err.message || "Invalid login name or password.");
      });
  };

  // Hàm xử lý Đăng ký
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    // Kiểm tra dữ liệu bắt buộc (Validation)
    if (!regLoginName.trim()) {
      setRegError("Login name is required.");
      return;
    }
    if (!regPassword) {
      setRegError("Password is required.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    if (!regFirstName.trim()) {
      setRegError("First name is required.");
      return;
    }
    if (!regLastName.trim()) {
      setRegError("Last name is required.");
      return;
    }

    const registeredName = regLoginName;

    // Gửi yêu cầu đăng ký lên server
    postModel("/user", {
      login_name: regLoginName,
      password: regPassword,
      first_name: regFirstName,
      last_name: regLastName,
      location: regLocation,
      description: regDescription,
      occupation: regOccupation,
    })
      .then(() => {
        setRegSuccess("Registration successful! Switching to login...");
        // Reset sạch form đăng ký
        setRegLoginName("");
        setRegPassword("");
        setRegConfirmPassword("");
        setRegFirstName("");
        setRegLastName("");
        setRegLocation("");
        setRegDescription("");
        setRegOccupation("");
        // Tự động chuyển về màn hình đăng nhập sau 1.5 giây
        setTimeout(() => {
          setIsRegisterMode(false);
          setLoginName(registeredName);
          setRegSuccess("");
        }, 1500);
      })
      .catch((err) => {
        setRegError(err.message || "Could not register user. The login name might already exist.");
      });
  };

  return (
    <div className="login-register-box">
      
      {!isRegisterMode ? (
        /* KHUNG ĐĂNG NHẬP */
        <div className="auth-card">
          <h2>Login</h2>
          {loginError && <div className="error-alert">{loginError}</div>}
          
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Login Name:</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your login name (e.g. ian)"
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn">Login</button>
          </form>

          {/* Dòng chữ chuyển đổi sang Đăng ký */}
          <p className="toggle-auth-text">
            Don't have an account?{" "}
            <span className="toggle-link" onClick={() => {
              setIsRegisterMode(true);
              setLoginError("");
            }}>
              Register here
            </span>
          </p>
        </div>
      ) : (
        /* KHUNG ĐĂNG KÝ */
        <div className="auth-card">
          <h2>Register</h2>
          {regError && <div className="error-alert">{regError}</div>}
          {regSuccess && <div className="success-alert">{regSuccess}</div>}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Login Name *:</label>
              <input
                type="text"
                value={regLoginName}
                onChange={(e) => setRegLoginName(e.target.value)}
                placeholder="Unique login name"
              />
            </div>

            <div className="form-group">
              <label>Password *:</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *:</label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Re-type password"
              />
            </div>

            <div className="form-group">
              <label>First Name *:</label>
              <input
                type="text"
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
                placeholder="Your first name"
              />
            </div>

            <div className="form-group">
              <label>Last Name *:</label>
              <input
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                placeholder="Your last name"
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={regLocation}
                onChange={(e) => setRegLocation(e.target.value)}
                placeholder="Current location (optional)"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={regDescription}
                onChange={(e) => setRegDescription(e.target.value)}
                placeholder="Short bio (optional)"
              />
            </div>

            <div className="form-group">
              <label>Occupation:</label>
              <input
                type="text"
                value={regOccupation}
                onChange={(e) => setRegOccupation(e.target.value)}
                placeholder="Occupation (optional)"
              />
            </div>

            <button type="submit" className="btn">Register Me</button>
          </form>

          {/* Dòng chữ chuyển đổi sang Đăng nhập */}
          <p className="toggle-auth-text">
            Already have an account?{" "}
            <span className="toggle-link" onClick={() => {
              setIsRegisterMode(false);
              setRegError("");
              setRegSuccess("");
            }}>
              Login here
            </span>
          </p>
        </div>
      )}

    </div>
  );
}

export default LoginRegister;
