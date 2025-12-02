document.addEventListener('DOMContentLoaded', () => {
    // 1. 歌曲数据
    const songList = [
        {
            title: "起风了",
            author: "买辣椒也用券",
            src: "https://music.163.com/song/media/outer/url?id=1330348068.mp3",
            cover: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1000&auto=format&fit=crop",
            bg: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "平凡之路",
            author: "朴树",
            src: "https://music.163.com/song/media/outer/url?id=28665218.mp3",
            cover: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
            bg: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "像我这样的人",
            author: "毛不易",
            src: "https://music.163.com/song/media/outer/url?id=569213220.mp3",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop",
            bg: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop"
        },
        {
            title: "测试音频 (必响)",
            author: "SoundHelix",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            cover: "https://img.icons8.com/color/480/audio-wave.png",
            bg: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    // 2. DOM 获取
    const audio = new Audio();
    const body = document.body;
    const titleDom = document.querySelector('.music-title');
    const authorDom = document.querySelector('.author-name');
    const recordImg = document.querySelector('.record-img');
    const progressContainer = document.querySelector('.progress');
    const progressInner = document.querySelector('.progress-inner');
    const playedTimeDom = document.querySelector('.played-time');
    const totalTimeDom = document.querySelector('.audio-time');

    const playPauseBtn = document.getElementById('playPause');
    const prevBtn = document.getElementById('before-music');
    const nextBtn = document.getElementById('last-music');
    const playModeBtn = document.getElementById('playMode');
    const speedBtn = document.getElementById('speed');
    const volumnInput = document.getElementById('volumn-togger');
    const uploadBtn = document.getElementById('upload');
    const fileInput = document.getElementById('file-input');

    const listBtn = document.getElementById('list');
    const playlistSidebar = document.querySelector('.playlist-sidebar');
    const playlistUl = document.querySelector('.playlist-ul');
    const closeListBtn = document.getElementById('close-list');

    // 3. 变量
    let currentIndex = 0;
    let isPlaying = false;
    let playMode = 0; 
    let isDragging = false; 
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.5];
    let speedIndex = 0;

    // 4. 核心功能
    function renderPlaylist() {
        playlistUl.innerHTML = ''; 
        songList.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-li';
            if (index === currentIndex) li.classList.add('active');
            li.innerHTML = `
                <span>${song.title}</span>
                <span>${song.author}</span>
            `;
            li.addEventListener('click', () => {
                if (index !== currentIndex) {
                    currentIndex = index;
                    loadSong(currentIndex);
                    playMusic();
                }
            });
            playlistUl.appendChild(li);
        });
    }

    function updatePlaylistHighlight() {
        const items = document.querySelectorAll('.playlist-li');
        items.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('active');
                // 只有当侧边栏是打开状态时，才滚动定位，避免页面加载时乱跳
                if (playlistSidebar.classList.contains('active')) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                item.classList.remove('active');
            }
        });
    }

    function loadSong(index) {
        const song = songList[index];
        titleDom.innerText = song.title;
        authorDom.innerText = song.author;
        audio.src = song.src;
        recordImg.style.backgroundImage = `url('${song.cover}')`;
        body.style.backgroundImage = `url('${song.bg}')`;
        
        progressInner.style.width = '0%';
        playedTimeDom.innerText = "00:00";
        totalTimeDom.innerText = "00:00";
        
        audio.addEventListener('loadedmetadata', () => {
            totalTimeDom.innerText = formatTime(audio.duration);
        }, { once: true });

        updatePlaylistHighlight();
    }

    function playMusic() {
        const p = audio.play();
        if (p !== undefined) {
            p.then(() => {
                isPlaying = true;
                playPauseBtn.classList.add('playing');
                recordImg.classList.add('playing');
                recordImg.style.animationPlayState = 'running';
            }).catch(err => console.error(err));
        }
    }

    function pauseMusic() {
        audio.pause();
        isPlaying = false;
        playPauseBtn.classList.remove('playing');
        recordImg.style.animationPlayState = 'paused';
    }

    function prevSong() {
        currentIndex--;
        if (currentIndex < 0) currentIndex = songList.length - 1;
        loadSong(currentIndex);
        if (isPlaying) playMusic();
    }

    function nextSong() {
        if (playMode === 2) {
            let newIndex = currentIndex;
            if (songList.length > 1) {
                while (newIndex === currentIndex) {
                    newIndex = Math.floor(Math.random() * songList.length);
                }
            }
            currentIndex = newIndex;
        } else {
            currentIndex++;
            if (currentIndex > songList.length - 1) currentIndex = 0;
        }
        loadSong(currentIndex);
        if (isPlaying) playMusic();
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
    }

    // 5. 事件监听

    // === 列表侧边栏交互 ===
    listBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (playlistSidebar.classList.contains('active')) {
            playlistSidebar.classList.remove('active');
        } else {
            playlistSidebar.classList.add('active');
            // 打开时手动触发一次滚动定位，确保能看到当前歌曲
            const activeItem = document.querySelector('.playlist-li.active');
            if(activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    closeListBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playlistSidebar.classList.remove('active');
    });

    playlistSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        playlistSidebar.classList.remove('active');
    });

    // 播放控件
    playPauseBtn.addEventListener('click', () => isPlaying ? pauseMusic() : playMusic());
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);

    audio.addEventListener('ended', () => {
        if (playMode === 1) {
            audio.currentTime = 0;
            playMusic();
        } else {
            nextSong();
        }
    });

    // 进度条
    audio.addEventListener('timeupdate', (e) => {
        if (!isDragging) {
            const { duration, currentTime } = e.target;
            if (duration) {
                const percent = (currentTime / duration) * 100;
                progressInner.style.width = `${percent}%`;
                playedTimeDom.innerText = formatTime(currentTime);
            }
        }
    });

    function updateBarVisuals(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const percent = clickX / rect.width;
        progressInner.style.width = `${percent * 100}%`;
        if (audio.duration) playedTimeDom.innerText = formatTime(percent * audio.duration);
    }

    progressContainer.addEventListener('mousedown', (e) => { isDragging = true; updateBarVisuals(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) updateBarVisuals(e); });
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            const rect = progressContainer.getBoundingClientRect();
            const clickX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            if (audio.duration) audio.currentTime = (clickX / rect.width) * audio.duration;
        }
    });

    // 上传
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const newSong = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                author: "本地音乐",
                src: fileUrl,
                cover: "https://img.icons8.com/color/480/vinyl-record.png",
                bg: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop"
            };
            songList.push(newSong);
            renderPlaylist(); 
            currentIndex = songList.length - 1;
            loadSong(currentIndex);
            playMusic();
            fileInput.value = '';
        }
    });

    playModeBtn.addEventListener('click', () => {
        playMode = (playMode + 1) % 3;
        playModeBtn.classList.remove('single', 'random');
        if (playMode === 0) playModeBtn.title = "列表循环";
        else if (playMode === 1) { playModeBtn.classList.add('single'); playModeBtn.title = "单曲循环"; }
        else { playModeBtn.classList.add('random'); playModeBtn.title = "随机播放"; }
    });

    volumnInput.addEventListener('input', (e) => audio.volume = e.target.value / 100);
    speedBtn.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speeds.length;
        audio.playbackRate = speeds[speedIndex];
        speedBtn.innerText = speeds[speedIndex] + 'X';
    });

    renderPlaylist();
    loadSong(currentIndex);
});