import "./App.css";
import React, { useState, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

/**
 * Component chính App - Điều phối toàn bộ hoạt động của ứng dụng Photo Sharing.
 */
const App = () => {
  // Trạng thái bật/tắt tính năng nâng cao (Stepper ảnh)
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  
  // Đối tượng lưu trữ thông tin User đang đăng nhập hiện tại
  const [loggedInUser, setLoggedInUser] = useState(null);

  // useEffect chạy một lần duy nhất khi ứng dụng tải để phục hồi phiên đăng nhập từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (e) {
        // Nếu parse lỗi thì reset sạch sẽ phiên đăng nhập
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Bật tắt tính năng nâng cao khi người dùng tick checkbox trên TopBar
  const handleToggleAdvanced = (event) => {
    setAdvancedFeatures(event.target.checked);
  };

  // Callback xử lý khi đăng nhập thành công
  const handleLogin = (user) => {
    setLoggedInUser(user);
    // Lưu thông tin user vào localStorage để không bị mất khi F5 tải lại trang
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  };

  // Callback xử lý khi đăng xuất
  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div>
        {/* THANH HEADER ĐIỀU HƯỚNG */}
        <TopBar
          loggedInUser={loggedInUser}
          onLogout={handleLogout}
          advancedFeatures={advancedFeatures}
          onToggleAdvanced={handleToggleAdvanced}
        />
        
        {/* Khoảng trống đệm tránh đè nội dung dưới thanh bar cố định */}
        <div className="main-topbar-buffer" />

        {/* CHIA BỐ CỤC SIDEBAR TRÁI VÀ NỘI DUNG PHẢI (M Master-Detail) */}
        <Grid container spacing={2} style={{ padding: "0 10px" }}>
          
          {/* CỘT TRÁI (3/12 độ rộng màn hình) - Danh sách User */}
          <Grid item sm={3}>
            <Paper className="main-grid-item" elevation={1}>
              <UserList loggedInUser={loggedInUser} />
            </Paper>
          </Grid>
          
          {/* CỘT PHẢI (9/12 độ rộng màn hình) - Nội dung Chi tiết/Ảnh/Login */}
          <Grid item sm={9}>
            <Paper className="main-grid-item" elevation={1}>
              <Routes>
                
                {/* 1. TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP */}
                {loggedInUser ? (
                  <>
                    {/* Xem chi tiết người dùng */}
                    <Route
                      path="/users/:userId"
                      element={<UserDetail />}
                    />
                    
                    {/* Xem album ảnh (chế độ thường hoặc nâng cao) */}
                    <Route
                      path="/photos/:userId"
                      element={<UserPhotos advancedFeatures={advancedFeatures} />}
                    />
                    
                    {/* Xem album ảnh ở chế độ Stepper kèm index ảnh */}
                    <Route
                      path="/photos/:userId/:photoIndex"
                      element={<UserPhotos advancedFeatures={advancedFeatures} />}
                    />
                    
                    {/* Trang mặc định điều hướng về chi tiết user hiện tại */}
                    <Route path="/" element={<Navigate to={`/users/${loggedInUser._id}`} />} />
                    
                    {/* Bất cứ đường dẫn nào khác không hợp lệ đều chuyển về trang chủ */}
                    <Route path="*" element={<Navigate to={`/users/${loggedInUser._id}`} />} />
                  </>
                ) : (
                  
                  // 2. TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP
                  // Tự động chuyển tất cả các đường dẫn truy cập về trang đăng nhập/đăng ký
                  <>
                    <Route path="*" element={<LoginRegister onLogin={handleLogin} />} />
                  </>
                )}

              </Routes>
            </Paper>
          </Grid>

        </Grid>
      </div>
    </Router>
  );
};

export default App;
