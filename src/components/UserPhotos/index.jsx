import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Typography, Card, CardMedia, Divider, Button, TextField, Box } from "@mui/material";
import "./styles.css";
import fetchModel, { postModel } from "../../lib/fetchModelData";

const BACKEND_URL = "http://localhost:8080";

// Hàm định dạng ngày tháng sang tiếng Anh
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US");
}

/**
 * Component CommentForm - Khung viết và gửi bình luận mới.
 */
function CommentForm({ photoId, onCommentAdded }) {
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    // Gửi POST thêm bình luận lên backend API /api/commentsOfPhoto/:photo_id
    postModel("/commentsOfPhoto/" + photoId, { comment: commentText })
      .then((response) => {
        setCommentText(""); // Xóa sạch ô nhập sau khi gửi
        onCommentAdded(photoId, response.data); // Báo lên cha cập nhật danh sách comment hiển thị ngay
      })
      .catch((err) => {
        setError(err.message || "Could not post comment.");
      });
  };

  return (
    <Box mt={2}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Add
        </Button>
      </form>
      {error && (
        <Typography variant="caption" color="error" style={{ marginTop: 5, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Component PhotoStepper - Hiển thị 1 ảnh duy nhất tại một thời điểm (Tính năng nâng cao).
 */
function PhotoStepper({ photos, userId, onCommentAdded }) {
  const { photoIndex: photoIndexParam } = useParams();
  const navigate = useNavigate();

  // Xác định vị trí ảnh hiện tại trên thanh URL (nếu có, không thì mặc định là ảnh 0)
  const currentIndex = photoIndexParam !== undefined
    ? Math.min(Math.max(parseInt(photoIndexParam, 10), 0), photos.length - 1)
    : 0;

  // Xử lý sang ảnh trước đó
  const handlePrev = () => {
    navigate(`/photos/${userId}/${currentIndex - 1}`);
  };

  // Xử lý sang ảnh kế tiếp
  const handleNext = () => {
    navigate(`/photos/${userId}/${currentIndex + 1}`);
  };

  if (photos.length === 0) {
    return (
      <Typography variant="body1" style={{ fontStyle: "italic", padding: 20 }}>
        No photos found.
      </Typography>
    );
  }

  const photo = photos[currentIndex];

  return (
    <Box p={2}>
      
      {/* KHUNG ĐIỀU HƯỚNG PREV / NEXT */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={1} bgcolor="#f5f5f5" border="1px solid #ccc" borderRadius={1}>
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="contained"
          color="primary"
        >
          &lt; Prev
        </Button>
        <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
          Photo {currentIndex + 1} of {photos.length}
        </Typography>
        <Button
          onClick={handleNext}
          disabled={currentIndex === photos.length - 1}
          variant="contained"
          color="primary"
        >
          Next &gt;
        </Button>
      </Box>

      {/* CHI TIẾT ẢNH HIỆN TẠI */}
      <Card variant="outlined" style={{ padding: 15 }}>
        <CardMedia
          component="img"
          image={BACKEND_URL + "/images/" + photo.file_name}
          alt={photo.file_name}
          style={{ maxHeight: 450, objectFit: "contain", border: "1px solid #ccc", marginBottom: 10 }}
        />
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Posted: {formatDate(photo.date_time)}
        </Typography>

        {/* DANH SÁCH BÌNH LUẬN */}
        <Box mt={2}>
          <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
            Comments ({photo.comments ? photo.comments.length : 0}):
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          
          {photo.comments && photo.comments.length > 0 ? (
            <Box mb={2}>
              {photo.comments.map((comment) => (
                <Box key={comment._id} mb={1.5} p={1} bgcolor="#f9f9f9" borderLeft="3px solid #1976d2" borderRadius="0 4px 4px 0">
                  <Typography variant="body2" style={{ fontWeight: "bold" }}>
                    <Link to={"/users/" + comment.user._id} style={{ textDecoration: "none", color: "#1976d2" }}>
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>
                    <span style={{ fontWeight: "normal", fontSize: "0.8rem", color: "#666", marginLeft: 8 }}>
                      ({formatDate(comment.date_time)})
                    </span>
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: 4 }}>
                    {comment.comment}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" style={{ fontStyle: "italic", color: "#777", marginBottom: 15 }}>
              No comments yet.
            </Typography>
          )}

          {/* FORM THÊM BÌNH LUẬN */}
          <CommentForm photoId={photo._id} onCommentAdded={onCommentAdded} />
        </Box>
      </Card>

    </Box>
  );
}

/**
 * Component chính UserPhotos - Hiển thị toàn bộ ảnh của User (hoặc dạng list, hoặc dạng stepper).
 */
function UserPhotos({ advancedFeatures }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách ảnh của người dùng từ API
  useEffect(() => {
    setLoading(true);
    fetchModel("/photosOfUser/" + userId)
      .then((response) => {
        setPhotos(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Could not load photos:", err);
        setPhotos([]);
        setLoading(false);
      });
  }, [userId]);

  // Callback nhận phản hồi từ CommentForm để cập nhật danh sách comment tức thì vào state
  const handleCommentAdded = (photoId, newComment) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => {
        if (photo._id === photoId) {
          return {
            ...photo,
            comments: [...(photo.comments || []), newComment],
          };
        }
        return photo;
      })
    );
  };

  if (loading) {
    return (
      <Typography variant="body1" style={{ fontStyle: "italic", padding: 20 }}>
        Loading photos...
      </Typography>
    );
  }

  if (photos.length === 0) {
    return (
      <Typography variant="body1" style={{ fontStyle: "italic", padding: 20 }}>
        No photos found.
      </Typography>
    );
  }

  // --- TRƯỜNG HỢP 1: BẬT TÍNH NĂNG NÂNG CAO (STEPPER) ---
  if (advancedFeatures) {
    return (
      <PhotoStepper
        photos={photos}
        userId={userId}
        onCommentAdded={handleCommentAdded}
      />
    );
  }

  // --- TRƯỜNG HỢP 2: CHẾ ĐỘ THƯỜNG (HIỂN THỊ DẠNG DANH SÁCH CUỘN) ---
  return (
    <Box p={2}>
      {photos.map((photo) => (
        <Box key={photo._id} mb={4}>
          <Card variant="outlined" style={{ padding: 15 }}>
            <CardMedia
              component="img"
              image={BACKEND_URL + "/images/" + photo.file_name}
              alt={photo.file_name}
              style={{ maxHeight: 450, objectFit: "contain", border: "1px solid #ccc", marginBottom: 10 }}
            />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Posted: {formatDate(photo.date_time)}
            </Typography>

            {/* DANH SÁCH BÌNH LUẬN */}
            <Box mt={2}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Comments ({photo.comments ? photo.comments.length : 0}):
              </Typography>
              <Divider style={{ margin: "10px 0" }} />
              
              {photo.comments && photo.comments.length > 0 ? (
                <Box mb={2}>
                  {photo.comments.map((comment) => (
                    <Box key={comment._id} mb={1.5} p={1} bgcolor="#f9f9f9" borderLeft="3px solid #1976d2" borderRadius="0 4px 4px 0">
                      <Typography variant="body2" style={{ fontWeight: "bold" }}>
                        <Link to={"/users/" + comment.user._id} style={{ textDecoration: "none", color: "#1976d2" }}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                        <span style={{ fontWeight: "normal", fontSize: "0.8rem", color: "#666", marginLeft: 8 }}>
                          ({formatDate(comment.date_time)})
                        </span>
                      </Typography>
                      <Typography variant="body2" style={{ marginTop: 4 }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" style={{ fontStyle: "italic", color: "#777", marginBottom: 15 }}>
                  No comments yet.
                </Typography>
              )}

              {/* Form viết bình luận */}
              <CommentForm photoId={photo._id} onCommentAdded={handleCommentAdded} />
            </Box>
          </Card>
        </Box>
      ))}
    </Box>
  );
}

export default UserPhotos;
