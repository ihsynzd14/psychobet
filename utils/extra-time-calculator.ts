import { MatchEvent, ExtraTimeCalculation, ExtraTimeEvent } from '../components/live-feed/types';

export class ExtraTimeCalculator {
  private calculations: ExtraTimeCalculation;

  constructor() {
    this.calculations = {
      firstHalf: { substitutions: 0, injuries: 0, varChecks: 0, incidents: 0, redCards: 0, total: 0 },
      secondHalf: { substitutions: 0, injuries: 0, varChecks: 0, incidents: 0, redCards: 0, total: 0 },
      history: []
    };
  }

  processEvents(events: MatchEvent[]): ExtraTimeCalculation {
    // Reset calculations
    this.calculations = {
      firstHalf: { substitutions: 0, injuries: 0, varChecks: 0, incidents: 0, redCards: 0, total: 0 },
      secondHalf: { substitutions: 0, injuries: 0, varChecks: 0, incidents: 0, redCards: 0, total: 0 },
      history: []
    };

    // Calculate for each phase
    this.calculations.firstHalf.substitutions = this.calculateSubstitutionTime(events, 'FirstHalf');
    this.calculations.firstHalf.injuries = this.calculateInjuryTime(events, 'FirstHalf');
    this.calculations.firstHalf.varChecks = this.calculateVarTime(events, 'FirstHalf');
    this.calculations.firstHalf.incidents = this.calculateIncidentTime(events, 'FirstHalf');
    this.calculations.firstHalf.redCards = this.calculateRedCardTime(events, 'FirstHalf');
    this.calculations.firstHalf.total = this.sumPhaseTime(this.calculations.firstHalf);

    this.calculations.secondHalf.substitutions = this.calculateSubstitutionTime(events, 'SecondHalf');
    this.calculations.secondHalf.injuries = this.calculateInjuryTime(events, 'SecondHalf');
    this.calculations.secondHalf.varChecks = this.calculateVarTime(events, 'SecondHalf');
    this.calculations.secondHalf.incidents = this.calculateIncidentTime(events, 'SecondHalf');
    this.calculations.secondHalf.redCards = this.calculateRedCardTime(events, 'SecondHalf');
    this.calculations.secondHalf.total = this.sumPhaseTime(this.calculations.secondHalf);

    // Kesişen olayları temizle ve toplamları yeniden hesapla
    this.removeOverlappingEvents();
    this.recalculateTotals();

    return this.calculations;
  }

  private calculateSubstitutionTime(events: MatchEvent[], phase: string): number {
    const substitutionEvents = events
      .filter(e => e.type === 'substitution' && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let batchStartTime: Date | null = null;
    let batchStartEvent: MatchEvent | null = null;
    let batchSize = 0;

    for (const event of substitutionEvents) {
      const eventTime = new Date(event.timestamp);

      if (!batchStartTime || eventTime.getTime() - batchStartTime.getTime() > 30000) {
        // New batch - add previous batch time
        if (batchSize > 0 && batchStartEvent !== null && batchStartTime !== null) {
          totalTime += 30; // 30 seconds per batch
          this.addToHistory({
            id: `sub-batch-${Date.now()}-${Math.random()}`,
            type: 'substitution',
            phase: phase as 'FirstHalf' | 'SecondHalf',
            startTime: batchStartTime.toISOString(),
            endTime: eventTime.toISOString(),
            duration: 30,
            description: `Substitution batch (${batchSize} players)`,
            timestamp: batchStartTime.toISOString(),
            timeElapsed: batchStartEvent.timeElapsed
          });
        }
        batchStartTime = eventTime;
        batchStartEvent = event;
        batchSize = 1;
      } else {
        // Same batch - increment size
        batchSize++;
      }
    }

    // Add last batch
    if (batchSize > 0 && batchStartEvent !== null && batchStartTime !== null) {
      totalTime += 30;
      this.addToHistory({
        id: `sub-batch-${Date.now()}-${Math.random()}`,
        type: 'substitution',
        phase: phase as 'FirstHalf' | 'SecondHalf',
        startTime: batchStartTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: 30,
        description: `Substitution batch (${batchSize} players)`,
        timestamp: batchStartTime.toISOString(),
        timeElapsed: batchStartEvent.timeElapsed
      });
    }

    return totalTime;
  }

  private calculateInjuryTime(events: MatchEvent[], phase: string): number {
    // Sort all events by timestamp to ensure chronological order
    const sortedEvents = [...events]
      .filter(e => e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let injuryStartTime: Date | null = null;
    let injuryStartEvent: MatchEvent | null = null;

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventTime = new Date(event.timestamp).getTime();

      // Check for start of injury - ONLY "The game is suspended due to an injured" messages
      if (event.type === 'systemMessage' && !injuryStartTime) {
        const message = event.details.message || '';

        // START: Only count "the game is suspended due to an injured" messages
        if (message.includes('The game is suspended due to an injured')) {
          // Look backwards for the nearest non-system event
          let startEvent = event;
          for (let j = i - 1; j >= 0; j--) {
            const prev = sortedEvents[j];
            // Use non-system event as start point (e.g. Throw In, Foul, etc.)
            // Also skip other system messages to find the actual game event
            if (prev.type !== 'systemMessage') {
              startEvent = prev;
              break;
            }
          }

          injuryStartTime = new Date(startEvent.timestamp);
          injuryStartEvent = startEvent;
        }
      }
      // Check for Danger State end signal - play has resumed
      // Accept Safe, Attack, or DangerousAttack as valid end signals
      else if (injuryStartTime && injuryStartEvent && event.type === 'dangerState') {
        const state = event.details.dangerState;

        if (state === 'Safe' || state === 'Attack' || state === 'DangerousAttack') {
          // Only count if it's been at least 10 seconds (avoid immediate state changes unrelated to stoppage)
          if (eventTime - injuryStartTime.getTime() > 10000) {
            const endTime = new Date(event.timestamp);
            const duration = Math.floor((endTime.getTime() - injuryStartTime.getTime()) / 1000);
            totalTime += duration;

            this.finishInjuryCalculation(injuryStartTime, endTime, phase, duration, injuryStartEvent.timeElapsed);

            injuryStartTime = null;
            injuryStartEvent = null;
          }
        }
      }
    }

    return totalTime;
  }

  private finishInjuryCalculation(startTime: Date, endTime: Date, phase: string, duration?: number, timeElapsed?: string) {
    const calcDuration = duration || Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    this.addToHistory({
      id: `injury-${Date.now()}-${Math.random()}`,
      type: 'injury',
      phase: phase as 'FirstHalf' | 'SecondHalf',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: calcDuration,
      description: `Injury treatment`,
      timestamp: startTime.toISOString(),
      timeElapsed: timeElapsed || '00:00'
    });
  }

  private calculateVarTime(events: MatchEvent[], phase: string): number {
    // Sort all events by timestamp to ensure chronological order
    const sortedEvents = [...events]
      .filter(e => e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const varEvents = sortedEvents.filter(e => e.type === 'var');

    let totalTime = 0;
    let varStartTime: Date | null = null;
    let varStartEvent: MatchEvent | null = null;
    let varReason = '';

    for (const event of varEvents) {
      const state = event.details.state;
      const isInProgress = event.details.isInProgress;

      // Start Condition: Danger (Possible VAR) or InProgress
      const isStart = state === 'Danger' || isInProgress;
      // End Condition: Safe (Completed) and NOT InProgress
      const isEnd = state === 'Safe' && !isInProgress;

      if (varStartTime === null) {
        if (isStart) {
          varStartTime = new Date(event.timestamp);
          varStartEvent = event;
          varReason = event.details.reason || 'VAR Check';
        }
      } else if (varStartTime !== null && varStartEvent !== null) {
        // Update reason if we have a more specific one now
        if (event.details.reason && event.details.reason !== 'VAR Check' && event.details.reason !== 'NotSet') {
          varReason = event.details.reason;
        }

        if (isEnd) {
          // VAR sequence ended
          let startTime = varStartTime;
          let endTime = new Date(event.timestamp);
          let timeElapsed = varStartEvent.timeElapsed;
          const reasonLC = varReason.toLowerCase();

          const startIdx = sortedEvents.findIndex(e => e.id === varStartEvent!.id);
          const endIdx = sortedEvents.findIndex(e => e.id === event.id);

          // 1. General Rule: Use Preceding and Succeeding events
          if (startIdx > 0) {
            const prev = sortedEvents[startIdx - 1];
            // Sanity check: don't jump too far back (limit to 5 mins)
            if (startTime.getTime() - new Date(prev.timestamp).getTime() < 300000) {
              startTime = new Date(prev.timestamp);
              timeElapsed = prev.timeElapsed; // Use preceding event time
            }
          }
          if (endIdx !== -1 && endIdx < sortedEvents.length - 1) {
            const next = sortedEvents[endIdx + 1];
            // Sanity check
            if (new Date(next.timestamp).getTime() - endTime.getTime() < 300000) {
              endTime = new Date(next.timestamp);
            }
          }

          const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

          // Check for overlap with existing injury events to avoid double counting
          // Injuries are calculated first, so they are already in history
          let overlapSeconds = 0;
          const injuryEvents = this.calculations.history.filter(h => h.type === 'injury' && h.phase === phase);

          for (const injury of injuryEvents) {
            if (!injury.startTime || !injury.endTime) continue;

            const iStart = new Date(injury.startTime).getTime();
            const iEnd = new Date(injury.endTime).getTime();
            const vStart = startTime.getTime();
            const vEnd = endTime.getTime();

            // Calculate intersection
            const intersectStart = Math.max(iStart, vStart);
            const intersectEnd = Math.min(iEnd, vEnd);

            if (intersectEnd > intersectStart) {
              overlapSeconds += (intersectEnd - intersectStart) / 1000;
            }
          }

          // Only add the non-overlapping time to the total
          // (We still record the full duration in history for distinct visibility, but adjust the sum)
          const effectiveDuration = Math.max(0, duration - Math.floor(overlapSeconds));
          totalTime += effectiveDuration;

          this.addToHistory({
            id: `var-${Date.now()}-${Math.random()}`,
            type: 'var',
            phase: phase as 'FirstHalf' | 'SecondHalf',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            description: `VAR Review: ${varReason}`,
            timestamp: startTime.toISOString(),
            timeElapsed: timeElapsed
          });

          varStartTime = null;
          varStartEvent = null;
          varReason = '';
        }
      }
    }

    return totalTime;
  }

  private calculateIncidentTime(events: MatchEvent[], phase: string): number {
    const sortedEvents = [...events]
      .filter(e => e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let incidentStartTime: Date | null = null;
    let incidentStartEvent: MatchEvent | null = null;

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventTime = new Date(event.timestamp).getTime();

      // Check for start of incident
      if (event.type === 'systemMessage' && !incidentStartTime) {
        const message = event.details.message?.toLowerCase() || '';

        // If message is "suspended" but NOT "injured" (injuries handled separately)
        if (message.includes('suspended') && !message.includes('injured')) {

          // Check if this incident is overlapping or very close to an injury
          // If an injury message exists within 60 seconds around this message, skip it
          // This prevents double counting water breaks that happen during injury stoppages
          const nearbyInjury = events.some(e =>
            e.type === 'systemMessage' &&
            e.details.message?.includes('The game is suspended due to an injured') &&
            Math.abs(new Date(e.timestamp).getTime() - eventTime) < 60000
          );

          if (!nearbyInjury) {
            // Look backwards for the nearest non-system event for START time
            let startEvent = event;
            for (let j = i - 1; j >= 0; j--) {
              const prev = sortedEvents[j];
              // Use non-system event as start point (e.g. Throw In, Foul, etc.)
              if (prev.type !== 'systemMessage') {
                startEvent = prev;
                break;
              }
            }

            incidentStartTime = new Date(startEvent.timestamp);
            incidentStartEvent = startEvent;
          }
        }
      }
      // Check for End Signal
      else if (incidentStartTime && incidentStartEvent) {
        let isEnd = false;
        let endTime = new Date(event.timestamp);

        // End Condition 1: System Message "Resumed"
        if (event.type === 'systemMessage') {
          const msg = event.details.message?.toLowerCase() || '';
          if (msg.includes('resumed') || msg.includes('play resumed')) {
            isEnd = true;
          }
        }
        // End Condition 2: Play Active (Danger States)
        else if (event.type === 'dangerState') {
          const s = event.details.dangerState;
          if (s === 'Safe' || s === 'Attack' || s === 'DangerousAttack') {
            // Only count if sufficient duration passed (e.g. > 10s)
            if (eventTime - incidentStartTime.getTime() > 10000) {
              isEnd = true;
            }
          }
        }

        if (isEnd) {
          const duration = Math.floor((endTime.getTime() - incidentStartTime.getTime()) / 1000);

          if (duration > 5) {
            totalTime += duration;

            this.addToHistory({
              id: `incident-${Date.now()}-${Math.random()}`,
              type: 'incident',
              phase: phase as 'FirstHalf' | 'SecondHalf',
              startTime: incidentStartTime.toISOString(),
              endTime: endTime.toISOString(),
              duration,
              description: `Incident delay`,
              timestamp: incidentStartTime.toISOString(),
              timeElapsed: incidentStartEvent.timeElapsed
            });
          }

          incidentStartTime = null;
          incidentStartEvent = null;
        }
      }
    }

    return totalTime;
  }

  private calculateRedCardTime(events: MatchEvent[], phase: string): number {
    const redCardEvents = events
      .filter(e => (e.type === 'redCard' || e.type === 'secondYellow') && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;

    for (const redCardEvent of redCardEvents) {
      // Check if this red card is associated with injury or VAR
      const hasAssociatedInjury = this.hasAssociatedInjury(events, redCardEvent);
      const hasAssociatedVar = this.hasAssociatedVar(events, redCardEvent);

      if (!hasAssociatedInjury && !hasAssociatedVar) {
        // Calculate time between previous event and this red card, and after
        const allEvents = events
          .filter(e => e.phase === phase)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const redCardIndex = allEvents.findIndex(e => e.id === redCardEvent.id);

        if (redCardIndex > 0) {
          const previousEvent = allEvents[redCardIndex - 1];
          const nextEvent = allEvents[redCardIndex + 1];

          if (previousEvent && nextEvent) {
            const delayStart = new Date(previousEvent.timestamp);
            const delayEnd = new Date(nextEvent.timestamp);
            const duration = Math.floor((delayEnd.getTime() - delayStart.getTime()) / 1000);

            // Only count if delay is reasonable (between 30 seconds and 3 minutes)
            if (duration >= 30 && duration <= 180) {
              totalTime += duration;

              this.addToHistory({
                id: `redcard-${Date.now()}-${Math.random()}`,
                type: 'redCard',
                phase: phase as 'FirstHalf' | 'SecondHalf',
                startTime: delayStart.toISOString(),
                endTime: delayEnd.toISOString(),
                duration,
                description: `Red card delay`,
                timestamp: delayStart.toISOString(),
                timeElapsed: redCardEvent.timeElapsed
              });
            }
          }
        }
      }
    }

    return totalTime;
  }

  private hasAssociatedInjury(events: MatchEvent[], redCardEvent: MatchEvent): boolean {
    const redCardTime = new Date(redCardEvent.timestamp).getTime();
    const injuryEvents = events.filter(e =>
      e.type === 'systemMessage' &&
      e.details.message?.toLowerCase().includes('injured') &&
      Math.abs(new Date(e.timestamp).getTime() - redCardTime) < 60000 // Within 1 minute
    );
    return injuryEvents.length > 0;
  }

  private hasAssociatedVar(events: MatchEvent[], redCardEvent: MatchEvent): boolean {
    const redCardTime = new Date(redCardEvent.timestamp).getTime();
    const varEvents = events.filter(e =>
      e.type === 'var' &&
      e.details.reason?.toLowerCase().includes('redcard') &&
      Math.abs(new Date(e.timestamp).getTime() - redCardTime) < 120000 // Within 2 minutes
    );
    return varEvents.length > 0;
  }

  private sumPhaseTime(phase: any): number {
    return phase.substitutions + phase.injuries + phase.varChecks + phase.incidents + phase.redCards;
  }

  private addToHistory(event: ExtraTimeEvent): void {
    this.calculations.history.push(event);
  }

  /**
   * Kesişen olayları tespit edip kısa olanı siler.
   * Aynı zaman diliminde birden fazla olay varsa (VAR + Injury gibi),
   * sadece en uzun olanı tutar.
   */
  private removeOverlappingEvents(): void {
    const phases = ['FirstHalf', 'SecondHalf'] as const;

    for (const phase of phases) {
      const phaseEvents = this.calculations.history.filter(e => e.phase === phase);
      const toRemove = new Set<string>();

      for (let i = 0; i < phaseEvents.length; i++) {
        if (toRemove.has(phaseEvents[i].id)) continue;

        for (let j = i + 1; j < phaseEvents.length; j++) {
          if (toRemove.has(phaseEvents[j].id)) continue;

          const a = phaseEvents[i];
          const b = phaseEvents[j];

          // startTime veya endTime yoksa atla
          if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;

          // Kesişim kontrolü
          const aStart = new Date(a.startTime).getTime();
          const aEnd = new Date(a.endTime).getTime();
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();

          const intersectStart = Math.max(aStart, bStart);
          const intersectEnd = Math.min(aEnd, bEnd);

          // Kesişim var mı?
          if (intersectEnd > intersectStart) {
            // Kısa olanı işaretle (silmek için)
            const aDuration = a.duration || 0;
            const bDuration = b.duration || 0;

            if (aDuration <= bDuration) {
              toRemove.add(a.id);
            } else {
              toRemove.add(b.id);
            }
          }
        }
      }

      // Kısa olanları history'den kaldır
      this.calculations.history = this.calculations.history.filter(e => !toRemove.has(e.id));
    }
  }

  /**
   * History'deki olaylara göre toplamları yeniden hesaplar.
   */
  private recalculateTotals(): void {
    // İlk yarı
    this.calculations.firstHalf.substitutions = this.sumByType('FirstHalf', 'substitution');
    this.calculations.firstHalf.injuries = this.sumByType('FirstHalf', 'injury');
    this.calculations.firstHalf.varChecks = this.sumByType('FirstHalf', 'var');
    this.calculations.firstHalf.incidents = this.sumByType('FirstHalf', 'incident');
    this.calculations.firstHalf.redCards = this.sumByType('FirstHalf', 'redCard');
    this.calculations.firstHalf.total = this.sumPhaseTime(this.calculations.firstHalf);

    // İkinci yarı
    this.calculations.secondHalf.substitutions = this.sumByType('SecondHalf', 'substitution');
    this.calculations.secondHalf.injuries = this.sumByType('SecondHalf', 'injury');
    this.calculations.secondHalf.varChecks = this.sumByType('SecondHalf', 'var');
    this.calculations.secondHalf.incidents = this.sumByType('SecondHalf', 'incident');
    this.calculations.secondHalf.redCards = this.sumByType('SecondHalf', 'redCard');
    this.calculations.secondHalf.total = this.sumPhaseTime(this.calculations.secondHalf);
  }

  /**
   * Belirli bir faz ve tip için toplam süreyi hesaplar.
   */
  private sumByType(phase: string, type: string): number {
    return this.calculations.history
      .filter(e => e.phase === phase && e.type === type)
      .reduce((sum, e) => sum + (e.duration || 0), 0);
  }
}