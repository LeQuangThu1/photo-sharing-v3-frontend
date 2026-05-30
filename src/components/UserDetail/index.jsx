import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Component UserDetail - Hiển thị chi tiết thông tin của một người dùng.
 * Các nhãn hiển thị đã được đổi về tiếng Anh.
 */
function UserDetail() {
  const { userId } = useParams(); // Lấy userId từ URL bằng React Router Hook
  const [user, setUser] = useState(null);

  // useEffect tự động kích hoạt bất cứ khi nào userId trên thanh URL thay đổi
  useEffect(() => {
    fetchModel("/user/" + userId)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error("Could not load user details:", err);
      });
  }, [userId]);

  if (!user) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div className="user-detail-card">
      
      {/* TÊN NGƯỜI DÙNG */}
      <h2>{user.first_name} {user.last_name}</h2>
      
      {/* CHI TIẾT CÁC TRƯỜNG THÔNG TIN */}
      <div className="detail-info">
        <p><strong>Location:</strong> {user.location || "Not specified"}</p>
        <p><strong>Occupation:</strong> {user.occupation || "Not specified"}</p>
        <p><strong>Description:</strong> {user.description || "Not specified"}</p>
      </div>

      {/* NÚT XEM DANH SÁCH ẢNH */}
      <div className="detail-action">
        <Link to={"/photos/" + userId} className="btn-view-photos">
          View Photos
        </Link>
      </div>

    </div>
  );
}

export default UserDetail;
