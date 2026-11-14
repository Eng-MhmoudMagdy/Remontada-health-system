document.addEventListener('DOMContentLoaded', () => {

    const splashScreen = document.getElementById('splash-screen');
    const mainUI = document.getElementById('main-ui');

    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        mainUI.classList.add('visible');
    }, 2200);


    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');

    let width, height, stars = [];

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createStars();
    }

    function createStars() {
        stars = [];
        const starCount = Math.floor((width * height) / 5500);
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.6 + 0.3,
                alpha: Math.random(),
                delta: (Math.random() * 0.015 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
                speedX: Math.random() * 0.07 + 0.01
            });
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, width, height);

        for (let star of stars) {
            star.alpha += star.delta;
            if (star.alpha <= 0.15 || star.alpha >= 1) {
                star.delta = -star.delta;
            }

            star.x -= star.speedX;
            if (star.x < 0) star.x = width;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(animateStars);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateStars();

    const astronautCard = document.getElementById('astronaut-login');

    astronautCard.addEventListener('click', () => {
        astronautCard.classList.add('clicked');
        setTimeout(() => {
            window.location.href = 'dashboard.html'; 
        }, 400);
    });
});