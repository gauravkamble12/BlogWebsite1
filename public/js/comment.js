const socket = io();

// Join the blog-specific room for real-time updates
if (typeof currentBlogId !== 'undefined') {
  socket.emit('join', `blog_${currentBlogId}`);
}

/**
 * Toggle Reply Form Visibility
 */
function toggleReplyForm(commentId) {
  const form = document.getElementById(`reply-form-${commentId}`);
  if (form) {
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
  }
}

/**
 * Handle Comment/Reply Submission (AJAX)
 */
async function handleCommentSubmit(event, blogId, parentId = null) {
  event.preventDefault();
  const form = event.target;
  const textarea = form.querySelector('textarea');
  const text = textarea.value.trim();

  if (!text) return;

  try {
    const response = await fetch(`/comment/${blogId}/ajax`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, parent: parentId }),
    });

    if (response.ok) {
      textarea.value = "";
      if (parentId) {
        toggleReplyForm(parentId);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Perspective Shared',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      const errorData = await response.json();
      Swal.fire({ icon: 'error', text: errorData.error || 'Failed to post' });
    }
  } catch (error) {
    console.error("Submission Error:", error);
    Swal.fire({ icon: 'error', text: 'Connection error' });
  }
}

/**
 * Listen for Real-time New Comments
 */
socket.on('new_comment', (comment) => {
  const container = document.getElementById('comments-container');
  const repliesList = document.getElementById(`replies-to-${comment.parent}`);

  if (comment.parent && repliesList) {
    // Inject as a Reply
    const replyHtml = createReplyHTML(comment);
    repliesList.insertAdjacentHTML('beforeend', replyHtml);
  } else {
    // Inject as a Root Comment (at the top)
    const commentHtml = createRootCommentHTML(comment);
    if (container) {
      container.insertAdjacentHTML('afterbegin', commentHtml);
    }
  }
});

/**
 * Helper: Build HTML for Root Comment
 */
function createRootCommentHTML(comment) {
  const isOwner = currentUserId === (comment.user?._id || comment.user);
  return `
    <div class="comment-root" id="comment-${comment._id}" style="animation: slideIn 0.5s ease-out;">
      <div style="display: flex; gap: 15px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 800;">
          ${comment.user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <span style="font-weight: 700;">${comment.user?.name || 'Observer'}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Just now</span>
            ${currentUserId ? `<button class="reply-btn" onclick="toggleReplyForm('${comment._id}')">Reply</button>` : ''}
            ${isOwner ? `
              <form action="/comment/${comment._id}/delete" method="POST" style="display: inline; margin-left: 10px;">
                <button type="submit" style="background: none; border: none; color: var(--accent); font-size: 0.75rem; cursor: pointer; font-weight: 700;">Delete</button>
              </form>
            ` : ''}
          </div>
          <p style="color: var(--text-muted); line-height: 1.5; margin: 0;">${comment.text}</p>
        </div>
      </div>

      <div class="reply-form-container" id="reply-form-${comment._id}">
        <form onsubmit="handleCommentSubmit(event, '${currentBlogId}', '${comment._id}')">
          <textarea placeholder="Write a reply..." required style="width: 100%; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: white; font-family: inherit; font-size: 0.95rem; min-height: 80px; margin-bottom: 10px; outline: none;"></textarea>
          <button type="submit" class="btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">Reply</button>
          <button type="button" class="btn-primary" onclick="toggleReplyForm('${comment._id}')" style="padding: 8px 16px; font-size: 0.85rem; background: transparent; color: var(--text-muted); border-color: var(--glass-border);">Cancel</button>
        </form>
      </div>

      <div class="replies-list" id="replies-to-${comment._id}"></div>
    </div>
  `;
}

/**
 * Helper: Build HTML for Reply
 */
function createReplyHTML(reply) {
  return `
    <div class="reply-container" style="animation: slideIn 0.5s ease-out;">
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">
          ${reply.user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 3px;">
            <span style="font-weight: 700; font-size: 0.9rem;">${reply.user?.name || 'Observer'}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Just now</span>
          </div>
          <p style="color: var(--text-muted); line-height: 1.4; font-size: 0.95rem; margin: 0;">${reply.text}</p>
        </div>
      </div>
    </div>
  `;
}

// Add animation keyframes via CSS injection
if (!document.getElementById('comment-animations')) {
  const style = document.createElement('style');
  style.id = 'comment-animations';
  style.innerHTML = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
