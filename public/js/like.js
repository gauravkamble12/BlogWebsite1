document.addEventListener("click", async e => {
  const btn = e.target.closest(".like-btn");
  if (!btn) return;

  const blogId = btn.dataset.blog;
  btn.classList.add("animate");

  try {
    const res = await fetch(`/like/${blogId}/ajax`, { method: "POST" });
    const data = await res.json();

    // Find the count span: either inside the button or in the nearest card container
    const countSpan = btn.querySelector(".like-count") || 
                     btn.closest(".bento-card")?.querySelector(".like-count") || 
                     btn.closest(".article-glass-card")?.querySelector(".like-count");
    
    if (countSpan) countSpan.innerText = data.count;
  } catch (err) {
    console.error("Like error:", err);
  }

  setTimeout(() => btn.classList.remove("animate"), 400);
});
