// Keyboard / touch / mouse → intent events, applied same-frame.
export class Input {
  constructor(canvas, handlers) {
    this.h = handlers; // { onJumpPress, onJumpRelease, onDuckPress, onDuckRelease, onStart, onPause, onMute, gesture }
    this.canvas = canvas;
    this.duckKeys = new Set();
    this.jumpKeys = new Set();
    this.touches = new Map(); // id -> 'jump' | 'duck'
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.h.gesture();
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        this.h.onStart();
        if (!this.jumpKeys.size) this.h.onJumpPress();
        this.jumpKeys.add(e.code);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (!this.duckKeys.size) this.h.onDuckPress();
        this.duckKeys.add(e.code);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.h.onPause();
      } else if (e.code === 'KeyM') {
        this.h.onMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.jumpKeys.delete(e.code) && !this.jumpKeys.size) this.h.onJumpRelease();
      if (this.duckKeys.delete(e.code) && !this.duckKeys.size) this.h.onDuckRelease();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.h.gesture();
      this.h.onStart();
      this.h.onJumpPress();
    });
    window.addEventListener('mouseup', () => this.h.onJumpRelease());

    const touchZone = (touch) => {
      const rect = this.canvas.getBoundingClientRect();
      const relY = (touch.clientY - rect.top) / rect.height;
      return relY > 2 / 3 ? 'duck' : 'jump';
    };

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.h.gesture();
      this.h.onStart();
      for (const t of e.changedTouches) {
        const zone = touchZone(t);
        this.touches.set(t.identifier, { zone, startY: t.clientY });
        if (zone === 'jump') this.h.onJumpPress();
        else this.h.onDuckPress();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const rec = this.touches.get(t.identifier);
        if (!rec) continue;
        // Swipe down → duck
        if (rec.zone === 'jump' && t.clientY - rec.startY > 40) {
          rec.zone = 'duck';
          this.h.onJumpRelease();
          this.h.onDuckPress();
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const rec = this.touches.get(t.identifier);
        if (!rec) continue;
        this.touches.delete(t.identifier);
        const stillJump = [...this.touches.values()].some(r => r.zone === 'jump');
        const stillDuck = [...this.touches.values()].some(r => r.zone === 'duck');
        if (rec.zone === 'jump' && !stillJump) this.h.onJumpRelease();
        if (rec.zone === 'duck' && !stillDuck) this.h.onDuckRelease();
      }
    };
    this.canvas.addEventListener('touchend', endTouch, { passive: false });
    this.canvas.addEventListener('touchcancel', endTouch, { passive: false });
  }
}
