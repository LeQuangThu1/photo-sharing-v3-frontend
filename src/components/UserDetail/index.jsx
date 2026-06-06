import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, Button, Divider } from "@mui/material";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Component UserDetail - Hiển thị chi tiết thông tin của một người dùng.
 * Sử dụng Material-UI để đồng bộ giao diện và màu sắc của Lab 1.
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
    return (
      <Typography variant="body1" style={{ fontStyle: "italic", padding: 20 }}>
        Loading...
      </Typography>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      
      {/* TÊN NGƯỜI DÙNG */}
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold" }}>
        {user.first_name} {user.last_name}
      </Typography>
      <Divider style={{ marginBottom: 20 }} />
      
      {/* CHI TIẾT CÁC TRƯỜNG THÔNG TIN */}
      <div style={{ marginBottom: 20 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Location:</strong> {user.location || "Not specified"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Occupation:</strong> {user.occupation || "Not specified"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {user.description || "Not specified"}
        </Typography>
      </div>

      {/* NÚT XEM DANH SÁCH ẢNH */}
      <div>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={"/photos/" + userId}
        >
          View Photos
        </Button>
      </div>

    </div>
  );
}

export default UserDetail;
