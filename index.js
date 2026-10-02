document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------------------------------------------
       Menu mobile
       ------------------------------------------------------- */
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    function setMenu(open) {
        hamburger.classList.toggle('active', open);
        navLinks.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    /* -------------------------------------------------------
       Header, barra de progresso e link ativo
       ------------------------------------------------------- */
    const header = document.getElementById('siteHeader');
    const scrollProgress = document.getElementById('scrollProgress');

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 40);
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const navMap = new Map();
    navLinks.querySelectorAll('a[href^="#"]').forEach(a => navMap.set(a.getAttribute('href').slice(1), a));
    // As seções das frentes acendem o link "Três frentes"
    ['hardware', 'ia', 'game'].forEach(id => navMap.set(id, navMap.get('frentes')));

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.querySelectorAll('a').forEach(a => a.classList.remove('is-active'));
                const link = navMap.get(entry.target.id);
                if (link) link.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));
    }

    /* -------------------------------------------------------
       Revelação suave ao rolar
       ------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        '.section-head, .front-header, .problema-intro, .stats, .split > *, .fronts, .loop, .media-split, ' +
        '.components, .ia-grid, .game-frame, .game-cards, .round, .impact-grid, .equation, ' +
        '.roadmap-scroll, .team, .closing-inner'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('visible'));
    }

    /* -------------------------------------------------------
       Vídeos: só carregam e tocam quando aparecem na tela
       ------------------------------------------------------- */
    const videos = document.querySelectorAll('video.lazy-video');
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    const source = video.querySelector('source[data-src]');
                    if (source) {
                        source.src = source.dataset.src;
                        source.removeAttribute('data-src');
                        video.load();
                    }
                    if (!prefersReducedMotion) video.play().catch(() => { });
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.35 });
        videos.forEach(v => videoObserver.observe(v));
    }
    if (prefersReducedMotion) {
        videos.forEach(v => v.setAttribute('controls', ''));
    }

    /* -------------------------------------------------------
       Roadmap: destaca o mês atual
       ------------------------------------------------------- */
    const now = new Date();
    if (now.getFullYear() === 2026) {
        document.querySelectorAll(`.roadmap-table [data-month="${now.getMonth()}"]`)
            .forEach(cell => cell.classList.add('is-now'));
    }

    /* -------------------------------------------------------
       Hero: simulação ilustrativa da estufa + decisão da IA
       ------------------------------------------------------- */
    const ui = {
        temp: document.getElementById('vTemp'),
        umid: document.getElementById('vUmid'),
        luz: document.getElementById('vLuz'),
        mTemp: document.getElementById('mTemp'),
        mUmid: document.getElementById('mUmid'),
        mLuz: document.getElementById('mLuz'),
        event: document.getElementById('panelEvent'),
        decision: document.getElementById('decision')
    };

    if (ui.temp) {
        // Faixas ideais ilustrativas (mesmas marcadas nas barras do painel)
        const ideal = { temp: [12, 26], umid: [55, 85], luz: [40, 80] };
        const scale = { temp: 40, umid: 100, luz: 100 };
        const calm = { temp: 21, umid: 68, luz: 62 };

        const events = [
            { msg: 'Imprevisto: excesso de sol', target: { temp: 31, umid: 62, luz: 96 } },
            { msg: 'Imprevisto: tempo seco', target: { temp: 23, umid: 40, luz: 66 } },
            { msg: 'Imprevisto: chuva intensa', target: { temp: 18, umid: 95, luz: 45 } },
            { msg: 'Imprevisto: queda brusca de temperatura', target: { temp: 8, umid: 70, luz: 42 } }
        ];

        const decisions = {
            nada: { icon: 'i-pause', text: 'Não fazer nada' },
            irrigar: { icon: 'i-drop', text: 'Irrigar' },
            travar: { icon: 'i-ban', text: 'Travar a irrigação' },
            proteger: { icon: 'i-shield', text: 'Proteger o cultivo' }
        };

        const state = { ...calm };
        let target = { ...calm };
        let phase = 'calm';
        let tick = 0;
        let eventIndex = 0;
        let lastDecision = 'nada';

        const out = (key, v) => v < ideal[key][0] || v > ideal[key][1];

        function decide() {
            if (out('temp', state.temp) || out('luz', state.luz)) return 'proteger';
            if (state.umid < ideal.umid[0]) return 'irrigar';
            if (state.umid > ideal.umid[1]) return 'travar';
            return 'nada';
        }

        function luzLabel(v) {
            if (v < 40) return 'Baixa';
            if (v <= 80) return 'Média';
            return 'Alta';
        }

        function render() {
            ui.temp.textContent = Math.round(state.temp);
            ui.umid.textContent = Math.round(state.umid);
            ui.luz.textContent = luzLabel(state.luz);
            ui.mTemp.style.width = Math.min(100, (state.temp / scale.temp) * 100) + '%';
            ui.mUmid.style.width = Math.min(100, state.umid) + '%';
            ui.mLuz.style.width = Math.min(100, state.luz) + '%';
            ['temp', 'umid', 'luz'].forEach(k => {
                document.querySelector(`.reading[data-key="${k}"]`).classList.toggle('is-off', out(k, state[k]));
            });

            const d = decide();
            if (d !== lastDecision) {
                lastDecision = d;
                ui.decision.innerHTML =
                    `<svg class="ic"><use href="#${decisions[d].icon}"/></svg><span>${decisions[d].text}</span>`;
                ui.decision.classList.remove('flash');
                void ui.decision.offsetWidth;
                ui.decision.classList.add('flash');
            }
        }

        function step() {
            tick++;
            // Máquina de estados: calmo -> imprevisto -> IA corrige -> calmo
            if (phase === 'calm' && tick >= 3) {
                const ev = events[eventIndex++ % events.length];
                target = { ...ev.target };
                ui.event.textContent = ev.msg;
                phase = 'event';
                tick = 0;
            } else if (phase === 'event' && tick >= 4) {
                target = { ...calm };
                ui.event.textContent = `A estufa autônoma agiu: ${decisions[decide()].text.toLowerCase()}`;
                phase = 'recover';
                tick = 0;
            } else if (phase === 'recover' && tick >= 4) {
                ui.event.textContent = 'Clima: tempo estável';
                phase = 'calm';
                tick = 0;
            }

            Object.keys(state).forEach(k => {
                const noise = (Math.random() - 0.5) * (k === 'temp' ? 0.8 : 2);
                state[k] += (target[k] - state[k]) * 0.42 + noise;
            });
            render();
        }

        render();
        if (!prefersReducedMotion) {
            let timer = setInterval(step, 1500);
            // pausa quando a aba não está visível
            document.addEventListener('visibilitychange', () => {
                clearInterval(timer);
                if (!document.hidden) timer = setInterval(step, 1500);
            });
        }
    }

    /* -------------------------------------------------------
       Ondas do hero (vídeo -> canvas com remoção do branco)
       ------------------------------------------------------- */
    const waveDecor = document.querySelector('.wave-decor');
    if (waveDecor && !prefersReducedMotion) {
        const hero = document.querySelector('.hero');
        hero.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            waveDecor.querySelectorAll('.wave-top-right, .wave-bottom-left').forEach((el, i) => {
                const f = i % 2 === 0 ? 1 : -1;
                el.style.transform = `translate(${x * f}px, ${y * f}px)`;
            });
        });

        // Os vídeos das ondas têm fundo branco; cada frame é desenhado
        // num canvas e o branco vira transparente (chroma-key).
        function setupChromaKeyVideo(container) {
            const video = container.querySelector('video');
            const canvas = container.querySelector('canvas.wave-canvas');
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const w = canvas.width;
            const h = canvas.height;
            let visible = true;

            video.play().catch(() => {
                const retry = () => video.play().catch(() => { });
                document.addEventListener('click', retry, { once: true });
                document.addEventListener('touchstart', retry, { once: true });
            });

            if ('IntersectionObserver' in window) {
                new IntersectionObserver(([entry]) => {
                    visible = entry.isIntersecting;
                    if (visible) video.play().catch(() => { }); else video.pause();
                }).observe(hero);
            }

            function draw() {
                if (visible && video.readyState >= 2) {
                    ctx.drawImage(video, 0, 0, w, h);
                    const frame = ctx.getImageData(0, 0, w, h);
                    const data = frame.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const minC = Math.min(data[i], data[i + 1], data[i + 2]);
                        if (minC > 245) {
                            data[i + 3] = 0;
                        } else if (minC > 190) {
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
