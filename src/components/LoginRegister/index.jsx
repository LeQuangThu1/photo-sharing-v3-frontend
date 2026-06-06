import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Alert, Box, Grid, Divider } from "@mui/material";
import "./styles.css";
import { postModel } from "../../lib/fetchModelData";

/**
 * Component LoginRegister - Quản lý chức năng Đăng nhập và Đăng ký.
 * Sử dụng Material-UI để đồng bộ giao diện và màu sắc của Lab 1.
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
    <Box sx={{ maxWidth: 500, margin: "40px auto", padding: "10px" }}>
      <Card variant="outlined">
        <CardContent>
          
          {!isRegisterMode ? (
            /* KHUNG ĐĂNG NHẬP */
            <Box>
              <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: "bold" }}>
                Login
              </Typography>
              <Divider style={{ marginBottom: 20 }} />
              
              {loginError && <Alert severity="error" style={{ marginBottom: 15 }}>{loginError}</Alert>}
              
              <form onSubmit={handleLoginSubmit}>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Login Name"
                    variant="outlined"
                    size="small"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Enter your login name (e.g. ian)"
                  />
                </Box>

                <Box mb={2}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    variant="outlined"
                    size="small"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 10 }}>
                  Login
                </Button>
              </form>

              {/* Dòng chữ chuyển đổi sang Đăng ký */}
              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Don't have an account?{" "}
                  <span
                    style={{ color: "#1976d2", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                    onClick={() => {
                      setIsRegisterMode(true);
                      setLoginError("");
                    }}
                  >
                    Register here
                  </span>
                </Typography>
              </Box>
            </Box>
          ) : (
            /* KHUNG ĐĂNG KÝ */
            <Box>
              <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: "bold" }}>
                Register
              </Typography>
              <Divider style={{ marginBottom: 20 }} />

              {regError && <Alert severity="error" style={{ marginBottom: 15 }}>{regError}</Alert>}
              {regSuccess && <Alert severity="success" style={{ marginBottom: 15 }}>{regSuccess}</Alert>}

              <form onSubmit={handleRegisterSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Login Name *"
                      variant="outlined"
                      size="small"
                      value={regLoginName}
                      onChange={(e) => setRegLoginName(e.target.value)}
                      placeholder="Unique login name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Password *"
                      variant="outlined"
                      size="small"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm Password *"
                      variant="outlined"
                      size="small"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      variant="outlined"
                      size="small"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Your first name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      variant="outlined"
                      size="small"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Your last name"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      variant="outlined"
                      size="small"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="Current location (optional)"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      size="small"
                      value={regDescription}
                      onChange={(e) => setRegDescription(e.target.value)}
                      placeholder="Short bio (optional)"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Occupation"
                      variant="outlined"
                      size="small"
                      value={regOccupation}
                      onChange={(e) => setRegOccupation(e.target.value)}
                      placeholder="Occupation (optional)"
                    />
                  </Grid>
                </Grid>

                <Box mt={3}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register Me
                  </Button>
                </Box>
              </form>

              {/* Dòng chữ chuyển đổi sang Đăng nhập */}
              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{" "}
                  <span
                    style={{ color: "#1976d2", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                    onClick={() => {
                      setIsRegisterMode(false);
                      setRegError("");
                      setRegSuccess("");
                    }}
                  >
                    Login here
                  </span>
                </Typography>
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;
