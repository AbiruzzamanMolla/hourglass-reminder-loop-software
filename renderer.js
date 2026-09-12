// Advanced Sound Synthesizer supporting multiple presets + custom audio file playback
class AudioNotifier {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.selectedSound = 'beep'; // 'beep' | 'chime' | 'digital' | 'zen' | 'custom'
    this.customAudioBuffer = null;
    this.customAudioName = '';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  setSoundType(type) {
    this.selectedSound = type;
  }

  async loadCustomAudio(dataUri, name) {
    this.init();
    try {
      const response = await fetch(dataUri);
      const arrayBuffer = await response.arrayBuffer();
      this.customAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.customAudioName = name;
      return true;
    } catch (err) {
      console.error('Failed to decode custom audio file:', err);
      return false;
    }
  }

  play() {
    if (!this.soundEnabled) return;
    this.init();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    switch (this.selectedSound) {
      case 'beep':
        this.playBeep();
        break;
      case 'chime':
        this.playChime();
        break;
      case 'digital':
        this.playDigitalAlarm();
        break;
      case 'zen':
        this.playZenGong();
        break;
      case 'custom':
        if (this.customAudioBuffer) {
          this.playCustomBuffer();
        } else {
          // Fallback to beep if no custom file loaded
          this.playBeep();
        }
        break;
      default:
        this.playBeep();
    }
  }

  // 1. Classic Clean Electronic Beep (Default)
  playBeep() {
    const now = this.ctx.currentTime;
    const beeps = [0, 0.16, 0.32]; // Triple crisp beep pattern

    beeps.forEach((delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + delay); // A5 pitch

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.35, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });
  }

  // 2. Multi-harmonic Bell Chime
  playChime() {
    const now = this.ctx.currentTime;
    const chords = [
      { freq: 523.25, gain: 0.3, decay: 2.2 },  // C5
      { freq: 659.25, gain: 0.22, decay: 2.0 }, // E5
      { freq: 783.99, gain: 0.25, decay: 2.5 }, // G5
      { freq: 1046.50, gain: 0.18, decay: 1.8 } // C6
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

  // 3. Digital Alarm Pulsing Tone
  playDigitalAlarm() {
    const now = this.ctx.currentTime;
    const pulses = [0, 0.14, 0.28, 0.42];

    pulses.forEach((delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1046.5, now + delay); // High punchy square wave

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.18, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  // 4. Low-resonance Zen Bowl / Meditation Gong
  playZenGong() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, now); // C4 deep gong
    osc.frequency.exponentialRampToValueAtTime(255, now + 3.0);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 3.5);
  }

  // 5. Custom Decoded Buffer
  playCustomBuffer() {
    if (!this.customAudioBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.customAudioBuffer;
    source.connect(this.ctx.destination);
    source.start(0);
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
    this.currentMode = 'hourglass'; // 'hourglass' | 'ring' | 'liquid' | 'pulse'
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
    this.btnSoundMute = document.getElementById('btn-sound-mute');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');
    this.soundMuteLabel = document.getElementById('sound-mute-label');

    // Sound picker
    this.soundSelector = document.getElementById('sound-selector');
    this.btnSoundPreview = document.getElementById('btn-sound-preview');
    this.btnCustomFile = document.getElementById('btn-custom-file');
    this.customFilenameDisplay = document.getElementById('custom-filename');

    // Titlebar
    this.btnMinimize = document.getElementById('btn-minimize');
    this.btnCloseTray = document.getElementById('btn-close-tray');

    // Mode Buttons
    this.modeHourglass = document.getElementById('mode-hourglass');
    this.modeRing = document.getElementById('mode-ring');
    this.modeLiquid = document.getElementById('mode-liquid');
    this.modePulse = document.getElementById('mode-pulse');

    // Stages
    this.hourglassStage = document.getElementById('hourglass-stage');
    this.ringStage = document.getElementById('ring-stage');
    this.liquidStage = document.getElementById('liquid-stage');
    this.pulseStage = document.getElementById('pulse-stage');

    // Stage internal elements
    this.topSandRect = document.getElementById('top-sand-rect');
    this.bottomSandMound = document.getElementById('bottom-sand-mound');
    this.sandStream = document.getElementById('sand-stream');
    this.ringProgress = document.getElementById('ring-progress');
    this.ringPercentage = document.getElementById('ring-percentage');
    this.liquidFill = document.getElementById('liquid-fill');
    this.pulseWrapper = document.querySelector('.pulse-wrapper');
    this.pulsePercentage = document.getElementById('pulse-percentage');

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
    this.updateVisuals(1);
  }

  initEventListeners() {
    // Window control IPC
    if (window.electronAPI) {
      this.btnMinimize.addEventListener('click', () => window.electronAPI.minimizeWindow());
      this.btnCloseTray.addEventListener('click', () => window.electronAPI.hideToTray());

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

    // Sound Mute Toggle
    this.btnSoundMute.addEventListener('click', () => {
      this.audio.soundEnabled = !this.audio.soundEnabled;
      this.btnSoundMute.classList.toggle('active', this.audio.soundEnabled);
      this.soundIconOn.style.display = this.audio.soundEnabled ? 'block' : 'none';
      this.soundIconOff.style.display = this.audio.soundEnabled ? 'none' : 'block';
      this.soundMuteLabel.textContent = this.audio.soundEnabled ? 'Audio On' : 'Muted';
    });

    // Sound Selector Dropdown
    this.soundSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      this.audio.setSoundType(selected);
      if (selected === 'custom') {
        this.btnCustomFile.style.display = 'flex';
        if (this.audio.customAudioName) {
          this.customFilenameDisplay.style.display = 'block';
          this.customFilenameDisplay.textContent = `File: ${this.audio.customAudioName}`;
        }
      } else {
        this.btnCustomFile.style.display = 'none';
        this.customFilenameDisplay.style.display = 'none';
      }
    });

    // Test / Preview Alert Sound
    this.btnSoundPreview.addEventListener('click', () => {
      this.audio.play();
    });

    // Custom File Picker Button
    this.btnCustomFile.addEventListener('click', async () => {
      if (window.electronAPI && window.electronAPI.selectAudioFile) {
        const fileData = await window.electronAPI.selectAudioFile();
        if (fileData) {
          const success = await this.audio.loadCustomAudio(fileData.dataUri, fileData.name);
          if (success) {
            this.customFilenameDisplay.style.display = 'block';
            this.customFilenameDisplay.textContent = `File: ${fileData.name}`;
            this.audio.play(); // preview on select
          }
        }
      }
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

    // Custom time input changes
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

    // Mode Switchers
    this.modeHourglass.addEventListener('click', () => this.switchMode('hourglass'));
    this.modeRing.addEventListener('click', () => this.switchMode('ring'));
    this.modeLiquid.addEventListener('click', () => this.switchMode('liquid'));
    this.modePulse.addEventListener('click', () => this.switchMode('pulse'));
  }

  switchMode(mode) {
    this.currentMode = mode;
    const tabs = [this.modeHourglass, this.modeRing, this.modeLiquid, this.modePulse];
    const stages = [this.hourglassStage, this.ringStage, this.liquidStage, this.pulseStage];

    tabs.forEach(tab => tab.classList.remove('active'));
    stages.forEach(stage => stage.style.display = 'none');

    if (mode === 'hourglass') {
      this.modeHourglass.classList.add('active');
      this.hourglassStage.style.display = 'flex';
    } else if (mode === 'ring') {
      this.modeRing.classList.add('active');
      this.ringStage.style.display = 'flex';
    } else if (mode === 'liquid') {
      this.modeLiquid.classList.add('active');
      this.liquidStage.style.display = 'flex';
    } else if (mode === 'pulse') {
      this.modePulse.classList.add('active');
      this.pulseStage.style.display = 'flex';
    }

    const fractionRemaining = this.remainingSeconds / this.totalSeconds;
    this.updateVisuals(fractionRemaining);
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

    // Activate particle animation
    this.sandStream.style.opacity = '1';
    this.sandParticles.start();
    if (this.pulseWrapper) this.pulseWrapper.classList.add('pulsing');

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
    if (this.pulseWrapper) this.pulseWrapper.classList.remove('pulsing');
  }

  resetTimer() {
    this.pauseTimer();
    this.isPaused = false;
    this.playBtnText.textContent = 'Start Timer';
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.updateVisuals(1);
    this.timeStatus.textContent = 'READY';

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
    if (this.pulseWrapper) this.pulseWrapper.classList.remove('pulsing');

    this.timeStatus.textContent = 'FINISHED!';
    this.audio.play();

    if (window.electronAPI) {
      window.electronAPI.notify('Timer Complete!', this.isLooping ? 'Restarting loop...' : 'Your timer has finished.');
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
    const elapsedFraction = 1 - fractionRemaining;

    // 1. Hourglass
    const topHeight = Math.max(0, 97 * fractionRemaining);
    const topY = 135 - topHeight;
    this.topSandRect.setAttribute('y', topY);
    this.topSandRect.setAttribute('height', topHeight);

    const moundPeakY = 244 - (95 * elapsedFraction);
    const pathD = `M 35 244 Q 100 ${moundPeakY} 165 244 L 165 244 L 35 244 Z`;
    this.bottomSandMound.setAttribute('d', pathD);

    // 2. Ring
    const circumference = 515;
    const offset = circumference * (1 - elapsedFraction);
    this.ringProgress.style.strokeDashoffset = offset;
    const elapsedPercentage = Math.round(elapsedFraction * 100);
    this.ringPercentage.textContent = `${elapsedPercentage}%`;

    // 3. Liquid Cylinder (drops with remaining time)
    if (this.liquidFill) {
      this.liquidFill.style.height = `${Math.round(fractionRemaining * 100)}%`;
    }

    // 4. Pulse
    if (this.pulsePercentage) {
      const remainingPercent = Math.round(fractionRemaining * 100);
      this.pulsePercentage.textContent = `${remainingPercent}%`;
    }
  }
}

// Instantiate once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new HourglassApp();
});
