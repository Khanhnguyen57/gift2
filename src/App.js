import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- CẤU HÌNH ---
const MY_PHOTOS = [
  "/image/pic1.jpg",
  "/image/pic2.jpg",
  "/image/pic3.jpg",
  "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600"
];
const BACKGROUND_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=christmas-ident-125623.mp3";
const HEART_TEXT = "Merry Christmas"; 
const YOUR_NAME = "Phương Thuỳ ❤️"; 

const MorphingIntro = ({ onFinish }) => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('tree'); 
  const [opacity, setOpacity] = useState(1);

  const handleClick = () => {
    if (mode === 'tree') {
      setMode('heart');
    } else if (mode === 'heart') {
      setOpacity(0);
      setTimeout(onFinish, 1000);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Tăng số lượng hạt lên để nhìn dày dặn hơn
    const particleCount = width < 768 ? 1200 : 2000; 
    
    // Tạo sao nền (Background stars)
    const stars = [];
    for(let i=0; i<200; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5
        });
    }

    // --- TẠO HÌNH DÁNG ---
    
    // 1. CÂY THÔNG (Đã sửa lỗi ngược)
    const createTreePoints = () => {
        const points = [];
        for (let i = 0; i < particleCount; i++) {
            // t đi từ 0 (đỉnh) đến 1 (đáy)
            const t = i / particleCount;
            
            // Góc xoắn ốc
            const angle = t * Math.PI * 25; 
            
            // Bán kính: Đỉnh (t=0) thì bán kính = 0, Đáy (t=1) thì bán kính lớn
            // Pow(t, 0.8) giúp cây phình ra tự nhiên hơn
            const radius = Math.pow(t, 0.8) * (Math.min(width, height) * 0.35); 
            
            // Y: Đỉnh ở trên (-height/2), Đáy ở dưới (+height/2)
            const y = (t - 0.5) * height * 0.85; 
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Phối màu: Xanh lá chủ đạo + Đỏ + Vàng + Trắng
            let color = '#2e8b57'; // Xanh lá
            const r = Math.random();
            if (r > 0.95) color = '#ffff00'; // Vàng (Đỉnh/Đèn)
            else if (r > 0.9) color = '#ff3333'; // Đỏ (Châu)
            else if (r > 0.8) color = '#ffffff'; // Tuyết
            else if (r > 0.6) color = '#3cb371'; // Xanh sáng hơn

            points.push({ x, y, z, color, originalColor: color });
        }
        return points;
    };

    // 2. TRÁI TIM (To hơn, đẹp hơn)
    const createHeartPoints = () => {
        const points = [];
        const scale = Math.min(width, height) * 0.02; // Phóng to tim
        for (let i = 0; i < particleCount; i++) {
            let t = (i / particleCount) * Math.PI * 2;
            
            // Công thức tim
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            // Random nhiễu để tạo độ dày cho tim (3D hơn)
            const z = (Math.random() - 0.5) * 100; 
            
            // Scale và jitter
            x = x * scale + (Math.random() - 0.5) * 15;
            y = y * scale + (Math.random() - 0.5) * 15;
            
            // Màu tim: Đỏ, Hồng, Trắng
            let color = '#ff0040';
            if (Math.random() > 0.7) color = '#ff66b2';
            if (Math.random() > 0.95) color = '#ffffff';

            points.push({ x, y, z, color, originalColor: color });
        }
        return points;
    };

    const treePoints = createTreePoints();
    const heartPoints = createHeartPoints();

    // Khởi tạo hạt bay lung tung lúc đầu
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: (Math.random() - 0.5) * width * 2,
            y: (Math.random() - 0.5) * height * 2,
            z: (Math.random() - 0.5) * 1000,
            tx: 0, ty: 0, tz: 0, color: '#fff'
        });
    }

    let rotation = 0;
    let time = 0;

    const render = () => {
        // Vẽ nền tối mờ có vệt
        ctx.fillStyle = 'rgba(10, 10, 20, 0.2)'; 
        ctx.fillRect(0, 0, width, height);
        
        // Vẽ sao nền bay lên nhẹ
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            star.y -= star.speed;
            if (star.y < 0) star.y = height;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
            ctx.fill();
        });

        // Xoay object
        rotation += 0.008;
        time += 0.05;

        const cx = width / 2;
        const cy = height / 2;

        particles.forEach((p, i) => {
            let target = mode === 'tree' ? treePoints[i] : heartPoints[i % heartPoints.length];
            
            if (target) {
                // Di chuyển hạt mượt mà (Easing)
                p.tx += (target.x - p.tx) * 0.04;
                p.ty += (target.y - p.ty) * 0.04;
                p.tz += (target.z - p.tz) * 0.04;
                p.color = target.color;
            }

            // Tính toán 3D
            let x = p.tx;
            let y = p.ty;
            let z = p.tz;

            // Hiệu ứng "Thở" (Pulse) cho cây/tim
            const pulse = 1 + Math.sin(time) * 0.03;
            x *= pulse; y *= pulse; z *= pulse;

            // Xoay quanh trục Y
            let x1 = x * Math.cos(rotation) - z * Math.sin(rotation);
            let z1 = x * Math.sin(rotation) + z * Math.cos(rotation);
            
            // Perspective
            let scale = 800 / (800 + z1); 
            let px = cx + x1 * scale;
            let py = cy + y * scale;

            // Vẽ hạt
            const size = scale * (mode === 'tree' ? 2 : 2.5);
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            
            // Hạt nào ở gần (z1 nhỏ) thì sáng hơn
            if (z1 < 0) {
                 ctx.shadowBlur = 10;
                 ctx.shadowColor = p.color;
            } else {
                 ctx.shadowBlur = 0;
            }
            
            ctx.fill();
        });

        animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  return (
    <div 
        className="morphing-intro" 
        style={{ opacity: opacity, transition: 'opacity 1s' }}
        onClick={handleClick}
    >
        <canvas ref={canvasRef} />
        
        <div className="intro-text">
            {mode === 'tree' ? "Chạm vào cây thông 🎄" : ""}
        </div>

        <div className={`heart-message ${mode === 'heart' ? 'show' : ''}`}>
            <div className="glow-text main-msg">{HEART_TEXT}</div>
            <div className="glow-text sub-msg">{YOUR_NAME}</div>
        </div>
    </div>
  );
};


// ==========================================
//  PHẦN CODE CŨ (GIỮ NGUYÊN)
// ==========================================
// ==========================================
//  PHẦN NỘI DUNG CHÍNH (ĐÃ TỐI ƯU MƯỢT HƠN)
// ==========================================
const PolaroidPhoto = ({ src, index }) => {
    // Tính toán góc xoay cố định ngay từ đầu để tránh render lại
    const rotation = useRef((Math.random() * 10 - 5) + 'deg').current;
    
    return (
      <div className="polaroid" style={{ '--rotation': rotation, zIndex: index }}>
        <div className="polaroid-inner"><img src={src} alt="Memory" loading="lazy" /></div>
      </div>
    );
};

const MainContent = () => {
    const [snowflakes, setSnowflakes] = useState([]);
    const [showSurprise, setShowSurprise] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio(BACKGROUND_MUSIC_URL));

    // Xử lý nhạc nền
    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;
        // Preload nhạc để bấm là chạy ngay
        audio.load();
        return () => audio.pause();
    }, []);

    const toggleMusic = () => {
        const audio = audioRef.current;
        if (isPlaying) audio.pause();
        else audio.play().catch(e => console.log("Chưa tương tác nên chưa phát nhạc đc"));
        setIsPlaying(!isPlaying);
    };

    // TỐI ƯU TUYẾT RƠI: Giảm tần suất rơi xuống 800ms (gần 1 giây) 1 hạt
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hidden) return; // Nếu ẩn tab thì không tạo tuyết
            
            const id = Date.now();
            const newFlake = { 
                id, 
                left: Math.random() * 100, 
                size: Math.random() * 10 + 5, // 5px - 15px
                duration: Math.random() * 5 + 5 
            };
            
            setSnowflakes(prev => {
                // Giới hạn tối đa 30 hạt tuyết trên màn hình để không lag
                const list = [...prev, newFlake];
                if (list.length > 30) list.shift(); 
                return list;
            });

        }, 800); 

        return () => clearInterval(interval);
    }, []);

    const handleGiftClick = () => {
        // Nếu chưa bật nhạc thì bật luôn
        if(!isPlaying) toggleMusic();
        
        setShowSurprise(true);
        // Tự động đóng sau 5 giây
        setTimeout(() => setShowSurprise(false), 5000);
    };

  return (
    <div className="christmas-wrapper content-fade-in">
      {/* Nút nhạc */}
      <button className="music-toggle" onClick={toggleMusic} style={{
          position: 'absolute', top: 20, right: 20, zIndex: 100,
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer', color: 'white'
      }}>
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* Render tuyết */}
      {snowflakes.map(flake => (
          <div key={flake.id} className="snowflake" style={{
              left: `${flake.left}%`, 
              fontSize: `${flake.size}px`, 
              animation: `fall ${flake.duration}s linear`
          }}>❄</div>
      ))}

      <main className="main-layout">
        <section className="card-section">
            <div className="glass-card">
                <h1 className="title">Merry Christmas!</h1>
                <p style={{color: '#ddd', fontSize: '0.9rem'}}>Iu emmm ❤️</p>
                
                <div className="tree-icon" style={{fontSize: '4rem', margin: '10px 0', textShadow: '0 0 20px gold'}}>
                    🎄
                </div>

                <div className="wishes">
                    Chúc embe của tui luôn luôn vui vẻ và hạnh phúc
                </div>
                
                <button className="gift-btn" onClick={handleGiftClick}>
                   🎁 Mở quà nào!
                </button>
            </div>
        </section>

        <section className="gallery-section">
            <div className="polaroid-stack">
                {MY_PHOTOS.map((imgUrl, index) => (
                    <PolaroidPhoto key={index} src={imgUrl} index={index} />
                ))}
            </div>
        </section>
      </main>
      
      {/* HỘP QUÀ POPUP - ĐÃ TỐI ƯU */}
      {showSurprise && (
        <div className="surprise-overlay" onClick={() => setShowSurprise(false)}>
          <div className="firework-container">
             {/* Hiệu ứng nổ giả lập bằng CSS */}
             <div className="firework" style={{left: '20%', top: '30%', '--c': '#ff0040', animationDelay: '0s'}}></div>
             <div className="firework" style={{left: '80%', top: '20%', '--c': '#ffd700', animationDelay: '0.2s'}}></div>
             <div className="firework" style={{left: '50%', top: '50%', '--c': '#00ff88', animationDelay: '0.4s'}}></div>
          </div>
          
          <div className="surprise-box">
             <h2>Surprise! 🎉</h2>
             <p>Yêu tui nhìu lơn nhó ❤️</p>
             <div style={{fontSize: '3rem', marginTop: '10px'}}>🧸 🌹 🍫</div>
          </div>
        </div>
      )}
    </div>
  );
};
const App = () => {
    const [introFinished, setIntroFinished] = useState(false);
    return (
        <>
            {!introFinished ? <MorphingIntro onFinish={() => setIntroFinished(true)} /> : <MainContent />}
        </>
    );
};

export default App;