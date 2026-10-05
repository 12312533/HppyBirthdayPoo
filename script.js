/* ========================================================
   SCRIPT UTAMA — LOGIKA TEKA-TEKI PIN, AUDIO & ANIMASI
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. LOGIKA PASSCODE / TEKA-TEKI PIN
       ========================================== */
    // SET TANGGAL JADIAN / PERNIKAHAN ANDA DI SINI (CONTOH: '1202')
    const CORRECT_PIN = "2707"; 
    
    let enteredPin = "";
    const pinDots = document.querySelectorAll('#pin-dots .dot');
    const pinCard = document.querySelector('.pin-card');
    const lockscreen = document.getElementById('pin-lockscreen');
    const mainContent = document.getElementById('main-content');
    
    // List Pesan Lucu Jika PIN Salah
    const errorQuotes = [
        "U really don't know, bae? 🥺",
        "You wrong babe! 😜",
        "Try again, sayang! 💔",
        "Masa lupa tanggal kita sih? 🥺"
    ];

    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    const closePopupBtn = document.getElementById('close-popup-btn');

    // Numpad Button Handler
    document.querySelectorAll('.num-btn[data-val]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (enteredPin.length < 4) {
                enteredPin += btn.getAttribute('data-val');
                updatePinDots();
            }
        });
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        enteredPin = "";
        updatePinDots();
    });

    document.getElementById('btn-submit').addEventListener('click', verifyPin);

    function updatePinDots() {
        pinDots.forEach((dot, idx) => {
            if (idx < enteredPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function verifyPin() {
        if (enteredPin === CORRECT_PIN) {
            // PIN BENAR
            lockscreen.style.opacity = '0';
            lockscreen.style.transform = 'scale(1.1)';
            setTimeout(() => {
                lockscreen.style.display = 'none';
                mainContent.classList.remove('locked');
                mainContent.classList.add('unlocked');
                window.scrollTo(0, 0);
            }, 1000);
        } else {
            // PIN SALAH
            pinCard.classList.add('shake-anim');
            setTimeout(() => pinCard.classList.remove('shake-anim'), 400);

            // Pop-up Eror Random Quote
            const randomQuote = errorQuotes[Math.floor(Math.random() * errorQuotes.length)];
            errorMessage.innerText = randomQuote;
            errorPopup.classList.add('active');

            enteredPin = "";
            updatePinDots();
        }
    }

    closePopupBtn.addEventListener('click', () => {
        errorPopup.classList.remove('active');
    });


    /* ==========================================
       2. EFEK PARALLAX & GERAKAN DYNAMIC MOUSE
       ========================================== */
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 30;
        const y = (window.innerHeight / 2 - e.clientY) / 30;

        document.querySelectorAll('.float-element').forEach(el => {
            const speed = el.getAttribute('data-speed') || 1;
            el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });


    /* ==========================================
       3. INTERAKSI PIRINGAN HITAM & MUSIC PLAYER
       (BAGIAN YANG DIPERBAIKI)
       ========================================== */
    const audioPlayer = document.getElementById('global-audio');
    const musicCards = document.querySelectorAll('.music-card');
    const vinylDisc = document.getElementById('vinyl-disc');
    const tonearm = document.getElementById('tonearm');
    let currentCard = null;

    // Ubah "1:15" atau "75" menjadi detik
    function parseTime(value) {
        if (!value) return 0;
        value = value.trim();
        if (value.includes(':')) {
            const parts = value.split(':');
            const m = parseInt(parts[0], 10) || 0;
            const sec = parseFloat(parts[1]) || 0;
            return m * 60 + sec;
        }
        return parseFloat(value) || 0;
    }

    function setPlayerUI(activeCard, isPlaying) {
        musicCards.forEach(c => c.querySelector('.play-btn-icon').innerHTML = '▶');
        if (activeCard && isPlaying) {
            activeCard.querySelector('.play-btn-icon').innerHTML = '⏸';
        }
        vinylDisc.classList.toggle('spinning', isPlaying);
        tonearm.classList.toggle('active', isPlaying);
    }

    // Setelah file siap, lompat ke waktu mulai (data-start)
    audioPlayer.addEventListener('loadedmetadata', () => {
        if (currentCard) {
            const start = parseTime(currentCard.getAttribute('data-start'));
            if (start > 0 && start < audioPlayer.duration) {
                audioPlayer.currentTime = start;
            }
        }
    });

    musicCards.forEach(card => {
        card.addEventListener('click', async () => {
            try {
                // Klik lagu yang sedang diputar -> pause
                if (currentCard === card && !audioPlayer.paused) {
                    audioPlayer.pause();
                    setPlayerUI(card, false);
                    return;
                }

                // Lagu baru -> muat file (encodeURI supaya spasi & kurung aman)
                if (currentCard !== card) {
                    currentCard = card;
                    audioPlayer.src = encodeURI(card.getAttribute('data-src'));
                    audioPlayer.load();
                }

                await audioPlayer.play();
                setPlayerUI(card, true); // UI berubah hanya jika benar-benar berhasil play
            } catch (err) {
                console.error("Gagal memutar musik:", err, "| File:", card.getAttribute('data-src'));
                setPlayerUI(null, false);
                currentCard = null;
            }
        });
    });

    audioPlayer.addEventListener('error', () => {
        const codes = {1: 'dibatalkan', 2: 'masalah jaringan', 3: 'gagal decode', 4: 'file tidak ditemukan / format tidak didukung'};
        const code = audioPlayer.error ? audioPlayer.error.code : 0;
        console.error("Audio error:", codes[code] || 'tidak diketahui', "| src:", audioPlayer.src);
    });

    audioPlayer.addEventListener('ended', () => {
        setPlayerUI(null, false);
        currentCard = null; // putar ulang berikutnya mulai lagi dari data-start
    });


    /* ==========================================
       4. ANIMASI SCROLL & MESIN TIK SURAT CINTA
       ========================================== */
    const animObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if(entry.target.classList.contains('letter-paper') && !isTypingStarted) {
                    startTypewriter();
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-anim').forEach(el => animObserver.observe(el));

    const suratTeks = 
    `Happy Birthday, Poo ku sayang 🤍
Semoga di umur kamu yang sekarang, kamu selalu sehat, bahagia, dan semua yang kamu inginkan bisa tercapai. Maaf tahun ini aku belum bisa kasih apa apa yang, INI JUGA OKINAWA GA ADA GRAB NYA KEK APA KEK GITU sedih aku. Kamu sehat sehat ya di sana sayang meskipun butuh waktu yang lama kita berjarak 4.108 km ini, aku harap apa yang kamu cari dan inginkan bisa terkabul sampai kita bisa di pertemukan lagi menjadi 0Km xixi, Semoga kita sama sama kuat untuk tetap bertahan dan sabar nya seluas samudra. 

Semoga kamu suka ya sayang sama hadiah kecilku, dan jangan lupa pulang kerja ada sesuatu yang menunggumu. Terimakasih udah selalu sabar ya menghadapi tantrumku, Sehat sehat lelaki kuatku. Memei sayang Sandy banyak banyak❤


Happy Birthday to my favorite person.
I’m really, really glad it’s you. ♡.`;

    const typeTarget = document.getElementById('typewriter-text');
    const signature = document.getElementById('signature');
    let i = 0;
    let isTypingStarted = false;

    function startTypewriter() {
        isTypingStarted = true;
        typeTarget.innerHTML = "";
        function typeWriter() {
            if (i < suratTeks.length) {
                typeTarget.innerHTML += suratTeks.charAt(i);
                i++;
                setTimeout(typeWriter, 35);
            } else {
                signature.classList.remove('hidden-sign');
            }
        }
        typeWriter();
    }

    /* ==========================================
       5. LOGIKA CLOSE-UP FOTO & PESAN TERSEMBUNYI
       ========================================== */
    const photoModal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-photo-img');
    const modalMessage = document.getElementById('modal-photo-message');
    const closePhotoModalBtn = document.getElementById('close-photo-modal');

    // Klik pada salah satu foto di roll film
    document.querySelectorAll('.film-photo').forEach(photo => {
        photo.addEventListener('click', () => {
            const imgTag = photo.querySelector('img');
            const message = photo.getAttribute('data-message') || "Pesan rahasia untukmu ♡";
            
            modalImg.src = imgTag.src;
            modalMessage.innerText = message;
            
            photoModal.classList.add('active');
        });
    });

    // Tutup Modal ketika tombol (X) diklik
    closePhotoModalBtn.addEventListener('click', () => {
        photoModal.classList.remove('active');
    });

    // Tutup Modal jika diklik di area luar gambar
    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) {
            photoModal.classList.remove('active');
        }
    });
});