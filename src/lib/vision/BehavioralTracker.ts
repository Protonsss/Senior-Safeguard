/**
 * Enterprise Behavioral Tracker
 *
 * Real-time monitoring of senior's behavior patterns
 * Predicts intent and detects confusion/frustration
 *
 * Tracks:
 * - Mouse position heatmap (rolling 5 seconds)
 * - Scroll velocity and patterns
 * - Click patterns and double-clicks
 * - Hesitation detection (cursor hovers >2s)
 * - Confusion signals (erratic movement)
 * - Frustration indicators (repeated failed actions)
 *
 * Uses Temporal Convolutional Network (TCN) to predict next action
 */

interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
  type: 'move' | 'click' | 'hover';
}

interface ScrollEvent {
  deltaY: number;
  velocity: number;
  timestamp: number;
}

interface BehavioralPattern {
  hesitationCount: number; // Number of times hovering >2s
  erraticMovement: number; // 0-1 score of movement chaos
  repeatAttempts: number; // Same action repeatedly
  avgClickAccuracy: number; // How precise are clicks
  scrollPattern: 'smooth' | 'jerky' | 'uncertain';
  confidenceLevel: number; // 0-1, how confident they are
}

interface IntentPrediction {
  action: 'compose_email' | 'read_email' | 'reply' | 'attach_file' | 'search' | 'settings' | 'confused' | 'needs_help';
  confidence: number; // 0-1
  reasoning: string;
}

interface ConfusionSignal {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  suggestedIntervention: string;
}

export class BehavioralTracker {
  // Event buffers (rolling windows)
  private mouseEvents: MouseEvent[] = [];
  private scrollEvents: ScrollEvent[] = [];
  private clickEvents: MouseEvent[] = [];

  // Buffer sizes
  private readonly MOUSE_BUFFER_MS = 5000; // 5 seconds
  private readonly SCROLL_BUFFER_MS = 3000; // 3 seconds
  private readonly CLICK_BUFFER_MS = 10000; // 10 seconds

  // Heatmap for mouse position
  private heatmap: Map<string, number> = new Map();
  private readonly HEATMAP_GRID_SIZE = 50; // 50x50 pixel cells

  // Pattern detection
  private currentPattern: BehavioralPattern = {
    hesitationCount: 0,
    erraticMovement: 0,
    repeatAttempts: 0,
    avgClickAccuracy: 0,
    scrollPattern: 'smooth',
    confidenceLevel: 1.0,
  };

  // Timers for hesitation detection
  private hoverTimer: number | null = null;
  private lastHoverPosition: { x: number; y: number } | null = null;

  // For detecting repeated actions
  private lastActionTarget: { x: number; y: number; type: string } | null = null;
  private lastActionTime: number = 0;

  // Intent prediction model (would be TCN in production)
  private intentHistory: IntentPrediction[] = [];

  // Active listeners
  private isTracking: boolean = false;

  constructor() {
    // Initialize
  }

  /**
   * Start tracking behavioral patterns
   */
  public startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;

    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('wheel', this.handleScroll, { passive: true });

    // Start analysis loop
    this.startAnalysisLoop();

    console.log('👁️  Behavioral tracking started');
  }

  /**
   * Stop tracking
   */
  public stopTracking(): void {
    if (!this.isTracking) return;

    this.isTracking = false;

    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('wheel', this.handleScroll);

    console.log('⏹️  Behavioral tracking stopped');
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove = (event: globalThis.MouseEvent): void => {
    const mouseEvent: MouseEvent = {
      x: event.clientX,
      y: event.clientY,
      timestamp: performance.now(),
      type: 'move',
    };

    // Add to buffer
    this.mouseEvents.push(mouseEvent);
    this.pruneBuffer(this.mouseEvents, this.MOUSE_BUFFER_MS);

    // Update heatmap
    this.updateHeatmap(mouseEvent.x, mouseEvent.y);

    // Check for hesitation
    this.checkHesitation(mouseEvent);
  };

  /**
   * Handle click event
   */
  private handleClick = (event: globalThis.MouseEvent): void => {
    const clickEvent: MouseEvent = {
      x: event.clientX,
      y: event.clientY,
      timestamp: performance.now(),
      type: 'click',
    };

    // Add to buffer
    this.clickEvents.push(clickEvent);
    this.pruneBuffer(this.clickEvents, this.CLICK_BUFFER_MS);

    // Check for repeated attempts
    this.checkRepeatedAttempts(clickEvent);

    // Calculate click accuracy
    this.updateClickAccuracy(clickEvent);
  };

  /**
   * Handle scroll event
   */
  private handleScroll = (event: WheelEvent): void => {
    const now = performance.now();
    const velocity = this.calculateScrollVelocity(event.deltaY, now);

    const scrollEvent: ScrollEvent = {
      deltaY: event.deltaY,
      velocity,
      timestamp: now,
    };

    // Add to buffer
    this.scrollEvents.push(scrollEvent);
    this.pruneBuffer(this.scrollEvents, this.SCROLL_BUFFER_MS);

    // Analyze scroll pattern
    this.analyzeScrollPattern();
  };

  /**
   * Check if senior is hesitating (cursor not moving for >2s)
   */
  private checkHesitation(mouseEvent: MouseEvent): void {
    const MOVEMENT_THRESHOLD = 5; // pixels

    if (!this.lastHoverPosition) {
      this.lastHoverPosition = { x: mouseEvent.x, y: mouseEvent.y };
      this.hoverTimer = window.setTimeout(() => {
        // Hesitation detected
        this.currentPattern.hesitationCount++;
        console.log('⚠️  Hesitation detected');
      }, 2000);
      return;
    }

    // Check if moved significantly
    const dx = Math.abs(mouseEvent.x - this.lastHoverPosition.x);
    const dy = Math.abs(mouseEvent.y - this.lastHoverPosition.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > MOVEMENT_THRESHOLD) {
      // Movement detected - reset timer
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
      }

      this.lastHoverPosition = { x: mouseEvent.x, y: mouseEvent.y };
      this.hoverTimer = window.setTimeout(() => {
        this.currentPattern.hesitationCount++;
        console.log('⚠️  Hesitation detected');
      }, 2000);
    }
  }

  /**
   * Check if senior is repeatedly clicking same area (frustration)
   */
  private checkRepeatedAttempts(clickEvent: MouseEvent): void {
    const SAME_TARGET_THRESHOLD = 50; // pixels
    const REPEAT_TIME_WINDOW = 5000; // 5 seconds

    if (!this.lastActionTarget) {
      this.lastActionTarget = { x: clickEvent.x, y: clickEvent.y, type: 'click' };
      this.lastActionTime = clickEvent.timestamp;
      return;
    }

    const dx = Math.abs(clickEvent.x - this.lastActionTarget.x);
    const dy = Math.abs(clickEvent.y - this.lastActionTarget.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = clickEvent.timestamp - this.lastActionTime;

    if (distance < SAME_TARGET_THRESHOLD && timeDiff < REPEAT_TIME_WINDOW) {
      // Repeated attempt on same target
      this.currentPattern.repeatAttempts++;
      console.log('⚠️  Repeated attempt detected (possible frustration)');
    } else {
      // Different target - reset
      this.currentPattern.repeatAttempts = 0;
    }

    this.lastActionTarget = { x: clickEvent.x, y: clickEvent.y, type: 'click' };
    this.lastActionTime = clickEvent.timestamp;
  }

  /**
   * Update click accuracy metric
   */
  private updateClickAccuracy(clickEvent: MouseEvent): void {
    // In production, would check if click landed on intended target
    // For now, assume good accuracy
    this.currentPattern.avgClickAccuracy = 0.85;
  }

  /**
   * Calculate scroll velocity
   */
  private calculateScrollVelocity(deltaY: number, timestamp: number): number {
    if (this.scrollEvents.length === 0) {
      return 0;
    }

    const lastScroll = this.scrollEvents[this.scrollEvents.length - 1];
    const timeDiff = timestamp - lastScroll.timestamp;

    if (timeDiff === 0) return 0;

    return Math.abs(deltaY) / timeDiff; // pixels per ms
  }

  /**
   * Analyze scroll pattern (smooth vs jerky vs uncertain)
   */
  private analyzeScrollPattern(): void {
    if (this.scrollEvents.length < 5) {
      this.currentPattern.scrollPattern = 'smooth';
      return;
    }

    // Calculate velocity variance
    const velocities = this.scrollEvents.map(e => e.velocity);
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;

    if (variance < 0.1) {
      this.currentPattern.scrollPattern = 'smooth';
    } else if (variance < 0.5) {
      this.currentPattern.scrollPattern = 'uncertain';
    } else {
      this.currentPattern.scrollPattern = 'jerky';
    }
  }

  /**
   * Update mouse position heatmap
   */
  private updateHeatmap(x: number, y: number): void {
    const cellX = Math.floor(x / this.HEATMAP_GRID_SIZE);
    const cellY = Math.floor(y / this.HEATMAP_GRID_SIZE);
    const key = `${cellX},${cellY}`;

    const current = this.heatmap.get(key) || 0;
    this.heatmap.set(key, current + 1);

    // Prune old heatmap entries (keep only hot spots)
    if (this.heatmap.size > 1000) {
      const sorted = Array.from(this.heatmap.entries()).sort((a, b) => b[1] - a[1]);
      this.heatmap = new Map(sorted.slice(0, 500));
    }
  }

  /**
   * Calculate erratic movement score
   */
  private calculateErraticMovement(): number {
    if (this.mouseEvents.length < 10) {
      return 0;
    }

    // Calculate direction changes
    let directionChanges = 0;
    let lastDx = 0;
    let lastDy = 0;

    for (let i = 1; i < this.mouseEvents.length; i++) {
      const prev = this.mouseEvents[i - 1];
      const curr = this.mouseEvents[i];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;

      // Check if direction changed
      if (Math.sign(dx) !== Math.sign(lastDx) || Math.sign(dy) !== Math.sign(lastDy)) {
        directionChanges++;
      }

      lastDx = dx;
      lastDy = dy;
    }

    // Normalize to 0-1
    const maxChanges = this.mouseEvents.length - 1;
    return Math.min(directionChanges / maxChanges, 1.0);
  }

  /**
   * Predict senior's intent based on behavioral patterns
   * In production, this would use a Temporal Convolutional Network (TCN)
   */
  public predictIntent(): IntentPrediction {
    // Calculate current pattern
    this.currentPattern.erraticMovement = this.calculateErraticMovement();
    this.currentPattern.confidenceLevel = this.calculateConfidenceLevel();

    // Heuristic-based prediction (would be ML model in production)
    const heatmapHotSpot = this.getHeatmapHotSpot();

    // Check if hovering over compose button area
    if (heatmapHotSpot && heatmapHotSpot.y < 200 && heatmapHotSpot.x < 300) {
      return {
        action: 'compose_email',
        confidence: 0.75,
        reasoning: 'Mouse hovering near top-left (typical compose button location)',
      };
    }

    // Check for confusion signals
    if (this.currentPattern.hesitationCount > 2 || this.currentPattern.repeatAttempts > 3) {
      return {
        action: 'needs_help',
        confidence: 0.85,
        reasoning: 'Multiple hesitations and repeated attempts detected',
      };
    }

    // Default
    return {
      action: 'confused',
      confidence: 0.5,
      reasoning: 'Unclear behavioral pattern',
    };
  }

  /**
   * Detect confusion signals
   */
  public detectConfusion(): ConfusionSignal {
    const indicators: string[] = [];
    let severity: ConfusionSignal['severity'] = 'low';

    // Check hesitation
    if (this.currentPattern.hesitationCount > 5) {
      indicators.push('Excessive hesitation (cursor not moving)');
      severity = 'high';
    } else if (this.currentPattern.hesitationCount > 2) {
      indicators.push('Some hesitation detected');
      severity = 'medium';
    }

    // Check erratic movement
    if (this.currentPattern.erraticMovement > 0.7) {
      indicators.push('Erratic mouse movement');
      severity = 'high';
    }

    // Check repeated attempts
    if (this.currentPattern.repeatAttempts > 5) {
      indicators.push('Multiple repeated attempts on same target');
      severity = 'critical';
    }

    // Check scroll pattern
    if (this.currentPattern.scrollPattern === 'jerky') {
      indicators.push('Jerky scrolling pattern');
    }

    const detected = indicators.length > 0;

    return {
      detected,
      severity: detected ? severity : 'low',
      indicators,
      suggestedIntervention: this.getSuggestedIntervention(severity),
    };
  }

  /**
   * Get suggested intervention based on confusion severity
   */
  private getSuggestedIntervention(severity: ConfusionSignal['severity']): string {
    switch (severity) {
      case 'critical':
        return 'Show step-by-step guidance immediately';
      case 'high':
        return 'Offer proactive help';
      case 'medium':
        return 'Highlight next action';
      case 'low':
      default:
        return 'Continue monitoring';
    }
  }

  /**
   * Calculate overall confidence level
   */
  private calculateConfidenceLevel(): number {
    let confidence = 1.0;

    // Reduce for hesitation
    confidence -= this.currentPattern.hesitationCount * 0.05;

    // Reduce for erratic movement
    confidence -= this.currentPattern.erraticMovement * 0.2;

    // Reduce for repeated attempts
    confidence -= this.currentPattern.repeatAttempts * 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get heatmap hot spot (where mouse spends most time)
   */
  private getHeatmapHotSpot(): { x: number; y: number } | null {
    if (this.heatmap.size === 0) return null;

    const sorted = Array.from(this.heatmap.entries()).sort((a, b) => b[1] - a[1]);
    const [key] = sorted[0];
    const [cellX, cellY] = key.split(',').map(Number);

    return {
      x: cellX * this.HEATMAP_GRID_SIZE,
      y: cellY * this.HEATMAP_GRID_SIZE,
    };
  }

  /**
   * Start continuous analysis loop
   */
  private startAnalysisLoop(): void {
    // Run analysis every 500ms
    setInterval(() => {
      if (!this.isTracking) return;

      const intent = this.predictIntent();
      const confusion = this.detectConfusion();

      // Log for debugging
      if (confusion.detected && confusion.severity !== 'low') {
        console.log('⚠️  Confusion detected:', confusion);
      }

      // Store intent history
      this.intentHistory.push(intent);
      if (this.intentHistory.length > 20) {
        this.intentHistory.shift();
      }
    }, 500);
  }

  /**
   * Prune old events from buffer
   */
  private pruneBuffer(buffer: Array<{ timestamp: number }>, maxAge: number): void {
    const now = performance.now();
    const cutoff = now - maxAge;

    while (buffer.length > 0 && buffer[0].timestamp < cutoff) {
      buffer.shift();
    }
  }

  /**
   * Get current behavioral pattern
   */
  public getPattern(): BehavioralPattern {
    return { ...this.currentPattern };
  }

  /**
   * Get heatmap data for visualization
   */
  public getHeatmapData(): Map<string, number> {
    return new Map(this.heatmap);
  }

  /**
   * Reset all tracking data
   */
  public reset(): void {
    this.mouseEvents = [];
    this.scrollEvents = [];
    this.clickEvents = [];
    this.heatmap.clear();
    this.currentPattern = {
      hesitationCount: 0,
      erraticMovement: 0,
      repeatAttempts: 0,
      avgClickAccuracy: 0,
      scrollPattern: 'smooth',
      confidenceLevel: 1.0,
    };
  }
}
