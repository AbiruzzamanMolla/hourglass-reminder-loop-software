// Sound Synthesizer using Web Audio API
class AudioNotifier {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  // Play a pleasant, resonant, multi-harmonic Tibetan bowl / digital chime bell
  playChime() {
    if (!this.soundEnabled) return;
    this.init();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Notes: C5 (523.25Hz), G5 (783.99Hz), C6 (1046.50Hz), E6 (1318.51Hz)
    const chords = [
      { freq: 523.25, gain: 0.35, decay: 2.2 },
      { freq: 659.25, gain: 0.25, decay: 2.0 },
      { freq: 783.99, gain: 0.3, decay: 2.5 },
      { freq: 1046.50, gain: 0.2, decay: 1.8 }
    ];

    chords.forEach((note, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + (index * 0.08));

      gain.gain.setValueAtTime(0.0001, now + (index * 0.08));
      gain.gain.exponentialRampToValueAtTime(note.gain, now + (index * 0.08) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (index * 0.08) + note.decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + (index * 0.08));
      osc.stop(now + (index * 0.08) + note.decay);
    });
  }
}

// Particle simulation for falling sand
class SandParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.animFrame = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = [];
  }

  loop() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Spawn 2 particles per frame
    if (Math.random() < 0.7) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 4,
        y: 0,
        vy: 2.5 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.8,
        size: 1.2 + Math.random() * 1.2,
        alpha: 0.8 + Math.random() * 0.2
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.vy;
      p.x += p.vx;

      this.ctx.fillStyle = `rgba(252, 211, 77, ${p.alpha})`;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);

      if (p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    this.animFrame = requestAnimationFrame(() => this.loop());
  }
}

// Main Timer Application Controller
class HourglassApp {
  constructor() {
    this.audio = new AudioNotifier();
    
    // State
    this.totalSeconds = 25 * 60; // default 25m
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = false;
    this.isPaused = false;
    this.isLooping = false;
    this.currentMode = 'hourglass'; // 'hourglass' | 'ring'
    this.timerInterval = null;
    this.lastTimestamp = null;

    // DOM Elements
    this.timeDisplay = document.getElementById('time-display');
    this.timeStatus = document.getElementById('time-status');
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.playBtnText = document.getElementById('play-btn-text');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.btnReset = document.getElementById('btn-reset');
    this.btnLoop = document.getElementById('btn-loop');
    this.loopStateText = document.getElementById('loop-state-text');
    this.btnSound = document.getElementById('btn-sound');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');

    // Titlebar
    this.btnMinimize = document.getElementById('btn-minimize');
    this.btnCloseTray = document.getElementById('btn-close-tray');

    // Visuals
    this.modeHourglass = document.getElementById('mode-hourglass');
    this.modeRing = document.getElementById('mode-ring');
    this.hourglassStage = document.getElementById('hourglass-stage');
    this.ringStage = document.getElementById('ring-stage');
    this.topSandRect = document.getElementById('top-sand-rect');
    this.bottomSandMound = document.getElementById('bottom-sand-mound');
    this.sandStream = document.getElementById('sand-stream');
    this.ringProgress = document.getElementById('ring-progress');
    this.ringPercentage = document.getElementById('ring-percentage');

    // Inputs
    this.inputHours = document.getElementById('input-hours');
    this.inputMinutes = document.getElementById('input-minutes');
    this.inputSeconds = document.getElementById('input-seconds');
    this.presetChips = document.querySelectorAll('.chip');

    // Particles
    const canvas = document.getElementById('sand-particles-canvas');
    this.sandParticles = new SandParticleSystem(canvas);

    this.initEventListeners();
    this.updateDisplay();
    this.updateVisuals(1); // 1 = 100% full top chamber
  }

  initEventListeners() {
    // Window control IPC
    if (window.electronAPI) {
      this.btnMinimize.addEventListener('click', () => window.electronAPI.minimizeWindow());
      this.btnCloseTray.addEventListener('click', () => window.electronAPI.hideToTray());

      // Listen for Tray actions
      window.electronAPI.onTimerAction((action) => {
        if (action === 'toggle') {
          this.togglePlayPause();
        } else if (action === 'reset') {
          this.resetTimer();
        }
      });
    }

    // Play/Pause & Reset
    this.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    this.btnReset.addEventListener('click', () => this.resetTimer());

    // Loop toggle
    this.btnLoop.addEventListener('click', () => {
      this.isLooping = !this.isLooping;
      this.btnLoop.classList.toggle('active', this.isLooping);
      this.loopStateText.textContent = this.isLooping ? 'ON' : 'OFF';
    });

    // Sound toggle
    this.btnSound.addEventListener('click', () => {
      this.audio.soundEnabled = !this.audio.soundEnabled;
      this.btnSound.classList.toggle('active', this.audio.soundEnabled);
      this.soundIconOn.style.display = this.audio.soundEnabled ? 'block' : 'none';
      this.soundIconOff.style.display = this.audio.soundEnabled ? 'none' : 'block';
    });

    // Preset chips
    this.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.presetChips.forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');
        const seconds = parseInt(chip.getAttribute('data-time'), 10);
        this.setTime(seconds);
      });
    });

    // Input changes
    const onInputChange = () => {
      const h = parseInt(this.inputHours.value) || 0;
      const m = parseInt(this.inputMinutes.value) || 0;
      const s = parseInt(this.inputSeconds.value) || 0;
      const total = (h * 3600) + (m * 60) + s;
      if (total > 0) {
        this.setTime(total, false);
      }
    };

    this.inputHours.addEventListener('change', onInputChange);
    this.inputMinutes.addEventListener('change', onInputChange);
    this.inputSeconds.addEventListener('change', onInputChange);

    // Mode Switcher
    this.modeHourglass.addEventListener('click', () => this.switchMode('hourglass'));
    this.modeRing.addEventListener('click', () => this.switchMode('ring'));
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'hourglass') {
      this.modeHourglass.classList.add('active');
      this.modeRing.classList.remove('active');
      this.hourglassStage.style.display = 'flex';
      this.ringStage.style.display = 'none';
    } else {
      this.modeRing.classList.add('active');
      this.modeHourglass.classList.remove('active');
      this.hourglassStage.style.display = 'none';
      this.ringStage.style.display = 'flex';
    }
  }

  setTime(seconds, syncInputs = true) {
    if (this.isRunning) {
      this.pauseTimer();
    }
    this.totalSeconds = Math.max(1, seconds);
    this.remainingSeconds = this.totalSeconds;

    if (syncInputs) {
      const h = Math.floor(this.totalSeconds / 3600);
      const m = Math.floor((this.totalSeconds % 3600) / 60);
      const s = this.totalSeconds % 60;
      this.inputHours.value = h;
      this.inputMinutes.value = m;
      this.inputSeconds.value = s;
    }

    this.updateDisplay();
    this.updateVisuals(1);
    this.timeStatus.textContent = 'READY';
  }

  togglePlayPause() {
    // Unlock audio context on user click
    this.audio.init();

    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.playBtnText.textContent = 'Pause';
    this.iconPlay.style.display = 'none';
    this.iconPause.style.display = 'block';
    this.btnPlayPause.classList.add('paused');
    this.timeStatus.textContent = 'COUNTING DOWN';

    // Visual Sand stream active
    this.sandStream.style.opacity = '1';
    this.sandParticles.start();

    this.lastTimestamp = Date.now();

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const delta = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;

      this.remainingSeconds = Math.max(0, this.remainingSeconds - delta);
      this.updateDisplay();

      const fractionRemaining = this.remainingSeconds / this.totalSeconds;
      this.updateVisuals(fractionRemaining);

      if (this.remainingSeconds <= 0) {
        this.onTimerComplete();
      }
    }, 100);
  }

  pauseTimer() {
    this.isRunning = false;
    this.isPaused = true;
    clearInterval(this.timerInterval);

    this.playBtnText.textContent = 'Resume';
    this.iconPlay.style.display = 'block';
    this.iconPause.style.display = 'none';
    this.btnPlayPause.classList.remove('paused');
    this.timeStatus.textContent = 'PAUSED';

    this.sandStream.style.opacity = '0';
    this.sandParticles.stop();
  }

  resetTimer() {
    this.pauseTimer();
    this.isPaused = false;
    this.playBtnText.textContent = 'Start Timer';
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.updateVisuals(1);
    this.timeStatus.textContent = 'READY';

    // Flip animation aesthetic on reset
    const wrapper = document.querySelector('.hourglass-wrapper');
    if (wrapper) {
      wrapper.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        wrapper.style.transition = 'none';
        wrapper.style.transform = 'rotate(0deg)';
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, 50);
      }, 600);
    }
  }

  onTimerComplete() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.remainingSeconds = 0;
    this.updateDisplay();
    this.updateVisuals(0);
    this.sandStream.style.opacity = '0';
    this.sandParticles.stop();

    this.timeStatus.textContent = 'FINISHED!';
    this.audio.playChime();

    // Trigger Desktop Notification
    if (window.electronAPI) {
      window.electronAPI.notify('Timer Complete!', this.isLooping ? 'Restarting loop...' : 'Your hourglass timer has finished.');
    }

    if (this.isLooping) {
      setTimeout(() => {
        this.remainingSeconds = this.totalSeconds;
        this.startTimer();
      }, 1200);
    } else {
      this.playBtnText.textContent = 'Start Timer';
      this.iconPlay.style.display = 'block';
      this.iconPause.style.display = 'none';
      this.btnPlayPause.classList.remove('paused');
    }
  }

  updateDisplay() {
    const totalSecs = Math.ceil(this.remainingSeconds);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const pad = (n) => n.toString().padStart(2, '0');
    const formatted = `${pad(h)}:${pad(m)}:${pad(s)}`;
    this.timeDisplay.textContent = formatted;

    if (window.electronAPI) {
      window.electronAPI.updateTrayTooltip(formatted);
    }
  }

  updateVisuals(fractionRemaining) {
    // 1. Hourglass Visual
    // Top chamber: starts at y=38, height=97 (full). As fraction decreases, y goes down from 38 to 135.
    const topHeight = Math.max(0, 97 * fractionRemaining);
    const topY = 135 - topHeight;
    this.topSandRect.setAttribute('y', topY);
    this.topSandRect.setAttribute('height', topHeight);

    // Bottom chamber mound: starts flat at y=244, rises into a pyramid peak as sand falls
    // Peak height rises from 244 up to 145 (amplitude 99)
    const elapsedFraction = 1 - fractionRemaining;
    const moundPeakY = 244 - (95 * elapsedFraction);
    const pathD = `M 35 244 Q 100 ${moundPeakY} 165 244 L 165 244 L 35 244 Z`;
    this.bottomSandMound.setAttribute('d', pathD);

    // 2. Ring Visual
    const circumference = 515; // 2 * PI * 82
    const offset = circumference * (1 - elapsedFraction);
    this.ringProgress.style.strokeDashoffset = offset;
    const percentage = Math.round(elapsedFraction * 100);
    this.ringPercentage.textContent = `${percentage}%`;
  }
}

// Instantiate once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new HourglassApp();
});
