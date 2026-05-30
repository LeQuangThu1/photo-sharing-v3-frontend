/**
 * fetchModelData.js - Bộ công cụ gửi request (gọi API) lên Server.
 * Dành cho người mới học: Sử dụng API fetch mặc định của trình duyệt để gửi các yêu cầu GET và POST.
 */

const BASE_URL = "http://localhost:8080/api";

// Hàm tiện ích để lấy token JWT được lưu trong localStorage của trình duyệt
function getToken() {
  return localStorage.getItem("token");
}

/**
 * fetchModel - Gửi yêu cầu GET để lấy dữ liệu từ server.
 * @param {string} url - Đường dẫn API (ví dụ: "/user/list" hoặc "/user/123")
 */
function fetchModel(url) {
  const token = getToken();
  const headers = {};

  // Nếu người dùng đã đăng nhập (có token), đính kèm token vào Header Authorization
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  return fetch(BASE_URL + url, { headers: headers })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Lỗi HTTP! Trạng thái: " + response.status);
      }
      return response.json(); // Chuyển đổi phản hồi sang dạng JSON
    })
    .then(function (data) {
      return { data: data }; // Trả về cấu trúc chứa data để tương thích với code cũ
    });
}

/**
 * postModel - Gửi yêu cầu POST với dữ liệu JSON (đăng nhập, đăng ký, thêm comment).
 * @param {string} url - Đường dẫn API (ví dụ: "/admin/login")
 * @param {object} body - Dữ liệu cần gửi (dưới dạng đối tượng JS)
 */
function postModel(url, body) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json", // Khai báo cho Server biết gửi dữ liệu dạng JSON
  };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  return fetch(BASE_URL + url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body), // Chuyển đối tượng JS thành chuỗi JSON để gửi đi
  })
    .then(function (response) {
      if (!response.ok) {
        // Nếu lỗi, đọc thông báo lỗi từ server để ném ra thông tin chuẩn
        return response.json().then(function (err) {
          throw new Error(err.error || "Yêu cầu thất bại");
        });
      }
      return response.json();
    })
    .then(function (data) {
      return { data: data };
    });
}

/**
 * uploadPhoto - Gửi yêu cầu POST chứa file ảnh vật lý lên server (upload ảnh).
 * @param {string} url - Đường dẫn API (ví dụ: "/photos/new")
 * @param {File} file - Đối tượng File ảnh được chọn từ ô input
 */
function uploadPhoto(url, file) {
  const token = getToken();
  const headers = {};

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  // Sử dụng FormData để gửi file nhị phân (binary)
  const formData = new FormData();
  formData.append("photo", file); // Đặt tên trường là "photo" để khớp với Multer ở backend

  return fetch(BASE_URL + url, {
    method: "POST",
    headers: headers,
    body: formData, // Gửi form-data
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (err) {
          throw new Error(err.error || "Tải ảnh lên thất bại");
        });
      }
      return response.json();
    })
    .then(function (data) {
      return { data: data };
    });
}

export default fetchModel;
export { postModel, uploadPhoto };
