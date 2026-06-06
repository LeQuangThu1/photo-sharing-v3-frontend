import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { List, ListItem, ListItemText, Divider, Typography } from "@mui/material";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Component UserList - Hiển thị danh sách người dùng ở sidebar bên trái.
 * Chỉ hoạt động khi người dùng hiện tại đã đăng nhập thành công.
 * Sử dụng Material-UI để đồng bộ giao diện của Lab 1.
 */
function UserList({ loggedInUser }) {
  const [users, setUsers] = useState([]);

  // Fetch danh sách người dùng khi loggedInUser thay đổi
  useEffect(() => {
    if (!loggedInUser) {
      setUsers([]);
      return;
    }

    // Gọi API lấy toàn bộ danh sách người dùng
    fetchModel("/user/list")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((err) => {
        console.error("Could not load user list:", err);
        setUsers([]);
      });
  }, [loggedInUser]);

  // Nếu chưa đăng nhập, trả về null (không hiển thị sidebar danh sách)
  if (!loggedInUser) {
    return null;
  }

  return (
    <div>
      <Typography variant="h6" style={{ padding: "10px 16px 5px", fontWeight: "bold" }}>
        Users
      </Typography>
      <Divider />
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem button component={Link} to={"/users/" + user._id}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
