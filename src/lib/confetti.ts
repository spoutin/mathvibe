import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  // Burst from center-left and center-right
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7, x: 0.3 },
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'],
  });

  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7, x: 0.7 },
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'],
  });
}
