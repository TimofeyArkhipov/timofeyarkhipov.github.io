/**
 * Turns variable frame time into equal simulation steps.
 * Keeps the game deterministic and independent of the monitor refresh rate.
 */
export class FixedStep {
  private acc = 0;

  constructor(
    private readonly step: number,
    private readonly maxSteps: number,
  ) {}

  advance(dt: number, update: (step: number) => void): void {
    this.acc += dt;
    let steps = 0;
    while (this.acc >= this.step && steps < this.maxSteps) {
      update(this.step);
      this.acc -= this.step;
      steps++;
    }
    // Too far behind (tab was in background etc.) - drop the backlog instead of freezing.
    if (steps === this.maxSteps) this.acc = 0;
  }

  reset(): void {
    this.acc = 0;
  }
}
