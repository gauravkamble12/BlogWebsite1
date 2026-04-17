document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".bento-card");

  cards.forEach((card) => {
    const images = card.querySelectorAll(".slider-img");
    if (images.length > 1) {
      let currentIndex = 0;

      setInterval(() => {
        // Remove active class from current image
        images[currentIndex].classList.remove("active");

        // Calculate next index
        currentIndex = (currentIndex + 1) % images.length;

        // Add active class to next image
        images[currentIndex].classList.add("active");
      }, 3000); // Change image every 3 seconds
    }
  });
});
