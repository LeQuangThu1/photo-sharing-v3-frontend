import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Component UserList - Hiển thị danh sách người dùng ở sidebar bên trái.
 * Chỉ hoạt động khi người dùng hiện tại đã đăng nhập thành công.
 * Nhãn hiển thị đã được đổi về tiếng Anh: "Users".
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
    <div className="user-list-sidebar">
      <h3>Users</h3>
      <ul className="user-ul">
        {users.map((user) => (
          <li key={user._id} className="user-li">
            <Link to={"/users/" + user._id} className="user-link">
              {user.first_name} {user.last_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
