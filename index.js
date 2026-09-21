document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link (melhora UX no mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll suave para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efeito de scroll no header (cores da identidade AgroLab)
    const header = document.querySelector('header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(20, 90, 50, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, #145A32 60%, #6FCF3D 100%)';
            header.style.backdropFilter = 'none';
        }
    });

    // Barra de progresso de rolagem
    const scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }
    }
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    // Animações de revelação ao rolar a página (fade + slide up)
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: caso o navegador não suporte IntersectionObserver
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // Leve efeito de paralaxe nas ondas decorativas do Hero, seguindo o mouse
    const waveDecor = document.querySelector('.wave-decor');
    if (waveDecor) {
        const hero = document.querySelector('.hero');
        hero.addEventListener('mousemove', (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 20;
            const y = (e.clientY / innerHeight - 0.5) * 20;
            waveDecor.querySelectorAll('.wave-top-right, .wave-bottom-left').forEach((el, i) => {
                const factor = i % 2 === 0 ? 1 : -1;
                el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
        });

        // As animações de fundo (vídeo) vêm com fundo branco sólido.
        // Como mix-blend-mode não funciona de forma confiável em <video>,
        // desenhamos cada frame num <canvas> e removemos o branco manualmente
        // (chroma-key via canvas), o que funciona em qualquer navegador.
        function setupChromaKeyVideo(container) {
            const video = container.querySelector('video');
            const canvas = container.querySelector('canvas.wave-canvas');
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const w = canvas.width;
            const h = canvas.height;

            video.play().catch(() => {
                // Alguns navegadores só liberam o play() após interação do usuário.
                // Nesse caso, tentamos novamente no primeiro clique/toque.
                const retry = () => {
                    video.play().catch(() => {});
                    document.removeEventListener('click', retry);
                    document.removeEventListener('touchstart', retry);
                };
                document.addEventListener('click', retry, { once: true });
                document.addEventListener('touchstart', retry, { once: true });
            });

            function draw() {
                if (video.readyState >= 2) {
                    ctx.drawImage(video, 0, 0, w, h);
                    const frame = ctx.getImageData(0, 0, w, h);
                    const data = frame.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const minC = Math.min(data[i], data[i + 1], data[i + 2]);
                        if (minC > 245) {
                            // Praticamente branco: totalmente transparente
                            data[i + 3] = 0;
                        } else if (minC > 190) {
                            // Rampa suave para suavizar as bordas antialiased
                            data[i + 3] = Math.round(255 * (245 - minC) / 55);
                        }
                    }
                    ctx.putImageData(frame, 0, 0);
                }
                requestAnimationFrame(draw);
            }
            requestAnimationFrame(draw);
        }

        waveDecor.querySelectorAll('.wave-top-right, .wave-bottom-left').forEach(setupChromaKeyVideo);
    }
});
