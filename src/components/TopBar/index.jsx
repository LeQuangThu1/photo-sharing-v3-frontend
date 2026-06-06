import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import "./styles.css";
import fetchModel, { uploadPhoto } from "../../lib/fetchModelData";

/**
 * Component TopBar - Thanh công cụ phía trên cùng của ứng dụng.
 * Sử dụng Material-UI để có giao diện chuẩn đẹp và kế thừa màu sắc của Lab 1.
 */
function TopBar({ loggedInUser, onLogout, advancedFeatures, onToggleAdvanced }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Trạng thái lưu trữ văn bản ngữ cảnh hiển thị ở giữa thanh bar
  const [contextText, setContextText] = useState("");
  
  // Tham chiếu tới ô input chọn file ẩn
  const fileInputRef = useRef(null);
  
  // Trạng thái thông báo upload (thành công hoặc thất bại)
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploadError, setIsUploadError] = useState(false);

  // useEffect để theo dõi sự thay đổi đường dẫn URL và cập nhật tiêu đề ngữ cảnh
  useEffect(() => {
    if (!loggedInUser) {
      setContextText("");
      return;
    }

    // Biểu thức chính quy tách userId và phân hệ hiện tại từ URL (ví dụ: /users/123 hoặc /photos/123)
    const match = location.pathname.match(/\/(users|photos)\/([^/]+)/);
    if (!match) {
      setContextText("");
      return;
    }

    const section = match[1]; // "users" hoặc "photos"
    const userId = match[2];  // ID người dùng

    // Gọi API lấy thông tin người dùng hiện tại để hiển thị tên lên TopBar
    fetchModel("/user/" + userId)
      .then((response) => {
        const user = response.data;
        if (!user) {
          setContextText("");
          return;
        }
        if (section === "users") {
          setContextText(`${user.first_name} ${user.last_name}`);
        } else if (section === "photos") {
          setContextText(`Photos of ${user.first_name} ${user.last_name}`);
        }
      })
      .catch(() => {
        setContextText("");
      });
  }, [location, loggedInUser]);

  // Xử lý khi nhấn nút Đăng xuất
  const handleLogoutClick = () => {
    localStorage.removeItem("token"); // Xóa token lưu trữ
    onLogout();                      // Báo trạng thái đăng xuất cho App.js
    navigate("/");                   // Chuyển hướng về trang chủ
  };

  // Kích hoạt ô chọn file ẩn khi bấm nút "Add Photo"
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Xử lý khi chọn xong file ảnh
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Gửi yêu cầu upload file lên API "/photos/new"
    uploadPhoto("/photos/new", file)
      .then(() => {
        setUploadMessage("Photo uploaded successfully!");
        setIsUploadError(false);
        // Tự động chuyển hướng về trang xem ảnh của chính mình để xem kết quả
        navigate("/photos/" + loggedInUser._id);
        
        // Ẩn thông báo sau 3 giây
        setTimeout(() => setUploadMessage(""), 3000);
      })
      .catch((err) => {
        setUploadMessage(`Upload failed: ${err.message}`);
        setIsUploadError(true);
        setTimeout(() => setUploadMessage(""), 3000);
      });

    // Reset lại ô input để có thể chọn tiếp cùng một file
    event.target.value = "";
  };

  return (
    <AppBar position="fixed" className="topbar-appBar">
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* TÊN HỌC VIÊN - BÊN TRÁI */}
        <Typography variant="h5" color="inherit" style={{ fontWeight: "bold" }}>
          Lê Quang Thu
        </Typography>

        {/* THÔNG TIN NGỮ CẢNH TRANG (Đang xem ai) */}
        <Typography variant="h6" color="inherit">
          {loggedInUser ? contextText : ""}
        </Typography>

        {/* CÁC NÚT ĐIỀU KHIỂN & TRẠNG THÁI ĐĂNG NHẬP - BÊN PHẢI */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          
          {/* Nút bật tắt tính năng nâng cao (Stepper) */}
          <FormControlLabel
            control={
              <Checkbox
                checked={!!advancedFeatures}
                onChange={onToggleAdvanced}
                color="secondary"
                style={{ color: "white" }}
              />
            }
            label="Enable Advanced Features"
            style={{ color: "white", margin: 0 }}
          />

          {loggedInUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Typography variant="body1" style={{ border: "1px solid rgba(255, 255, 255, 0.5)", padding: "4px 8px" }}>
                Hi {loggedInUser.first_name}
              </Typography>
              
              {/* Input file ẩn phục vụ việc tải ảnh */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button onClick={handleUploadButtonClick} color="inherit" variant="outlined">
                Add Photo
              </Button>

              <Button onClick={handleLogoutClick} color="inherit">
                Logout
              </Button>
            </div>
          ) : (
            <Typography variant="body1" style={{ fontStyle: "italic", color: "rgba(255, 255, 255, 0.7)" }}>
              Please Login
            </Typography>
          )}

        </div>

      </Toolbar>

      {/* THÔNG BÁO UPLOAD NỔI (TOAST) */}
      {uploadMessage && (
        <div className={`toast-notification ${isUploadError ? "toast-error" : "toast-success"}`} style={{ color: "#333" }}>
          {uploadMessage}
        </div>
      )}

    </AppBar>
  );
}

export default TopBar;
