/* Scroll Reveal Animation */
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".blog-card");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("reveal-hidden");
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    cards.forEach(card => {
        card.classList.add("reveal-hidden");
        observer.observe(card);
    });
});
