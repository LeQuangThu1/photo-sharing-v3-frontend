import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import fetchModel, { uploadPhoto } from "../../lib/fetchModelData";

/**
 * Component TopBar - Thanh công cụ phía trên cùng của ứng dụng.
 * Sử dụng HTML thuần thay vì Material-UI để học viên dễ theo dõi.
 * Các nhãn hiển thị đã được đưa về tiếng Anh đúng theo yêu cầu tài liệu.
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
    <header className="main-navbar">
      
      {/* TÊN HỌC VIÊN - BÊN TRÁI */}
      <div className="navbar-brand">
        Lê Quang Thu
      </div>

      {/* THÔNG TIN NGỮ CẢNH TRANG (Đang xem ai) */}
      <div className="navbar-context">
        {loggedInUser ? contextText : ""}
      </div>

      {/* CÁC NÚT ĐIỀU KHIỂN & TRẠNG THÁI ĐĂNG NHẬP - BÊN PHẢI */}
      <div className="navbar-actions">
        
        {/* Nút bật tắt tính năng nâng cao (Stepper) */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!advancedFeatures}
            onChange={onToggleAdvanced}
          />
          Enable Advanced Features
        </label>

        {loggedInUser ? (
          <div className="user-logged-in-controls">
            <span className="welcome-msg">Hi {loggedInUser.first_name}</span>
            
            {/* Input file ẩn phục vụ việc tải ảnh */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button onClick={handleUploadButtonClick}>
              Add Photo
            </button>

            <button onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        ) : (
          <span className="please-login-text">Please Login</span>
        )}

      </div>

      {/* THÔNG BÁO UPLOAD NỔI (TOAST) */}
      {uploadMessage && (
        <div className={`toast-notification ${isUploadError ? "toast-error" : "toast-success"}`}>
          {uploadMessage}
        </div>
      )}

    </header>
  );
}

export default TopBar;
