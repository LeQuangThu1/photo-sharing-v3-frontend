import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    <div className="comment-form-container">
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          rows="2"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="comment-textarea"
        />
        <button type="submit" className="btn-add-comment">Add</button>
      </form>
      {error && <div className="comment-error">{error}</div>}
    </div>
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
    return <div className="no-photos">No photos found.</div>;
  }

  const photo = photos[currentIndex];

  return (
    <div className="stepper-container">
      
      {/* KHUNG ĐIỀU HƯỚNG PREV / NEXT */}
      <div className="stepper-navigation">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="stepper-btn"
        >
          &lt; Prev
        </button>
        <span className="stepper-counter">
          Photo {currentIndex + 1} of {photos.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === photos.length - 1}
          className="stepper-btn"
        >
          Next &gt;
        </button>
      </div>

      {/* CHI TIẾT ẢNH HIỆN TẠI */}
      <div className="photo-card">
        <img
          src={BACKEND_URL + "/images/" + photo.file_name}
          alt={photo.file_name}
          className="photo-image"
        />
        <div className="photo-date">
          Posted: {formatDate(photo.date_time)}
        </div>

        {/* DANH SÁCH BÌNH LUẬN */}
        <div className="comments-section">
          <h4>Comments ({photo.comments ? photo.comments.length : 0}):</h4>
          
          {photo.comments && photo.comments.length > 0 ? (
            <ul className="comments-list">
              {photo.comments.map((comment) => (
                <li key={comment._id} className="comment-item">
                  <div className="comment-author">
                    <Link to={"/users/" + comment.user._id}>
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>
                    <span className="comment-time"> ({formatDate(comment.date_time)})</span>
                  </div>
                  <div className="comment-text">{comment.comment}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-comments">No comments yet.</p>
          )}

          {/* FORM THÊM BÌNH LUẬN */}
          <CommentForm photoId={photo._id} onCommentAdded={onCommentAdded} />
        </div>
      </div>

    </div>
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
    return <div className="loading-text">Loading photos...</div>;
  }

  if (photos.length === 0) {
    return <div className="no-photos">No photos found.</div>;
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
    <div className="photos-list-container">
      {photos.map((photo) => (
        <div key={photo._id} className="photo-card-wrapper">
          
          {/* Ảnh */}
          <div className="photo-card">
            <img
              src={BACKEND_URL + "/images/" + photo.file_name}
              alt={photo.file_name}
              className="photo-image"
            />
            <div className="photo-date">
              Posted: {formatDate(photo.date_time)}
            </div>

            {/* Bình luận */}
            <div className="comments-section">
              <h4>Comments ({photo.comments ? photo.comments.length : 0}):</h4>
              
              {photo.comments && photo.comments.length > 0 ? (
                <ul className="comments-list">
                  {photo.comments.map((comment) => (
                    <li key={comment._id} className="comment-item">
                      <div className="comment-author">
                        <Link to={"/users/" + comment.user._id}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                        <span className="comment-time"> ({formatDate(comment.date_time)})</span>
                      </div>
                      <div className="comment-text">{comment.comment}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-comments">No comments yet.</p>
              )}

              {/* Form viết bình luận */}
              <CommentForm photoId={photo._id} onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          <hr className="photo-separator" />
        </div>
      ))}
    </div>
  );
}

export default UserPhotos;
