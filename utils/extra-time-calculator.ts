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

    return this.calculations;
  }

  private calculateSubstitutionTime(events: MatchEvent[], phase: string): number {
    const substitutionEvents = events
      .filter(e => e.type === 'substitution' && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let batchStartTime: Date | null = null;
    let batchSize = 0;

    substitutionEvents.forEach(event => {
      const eventTime = new Date(event.timestamp);
      
      if (!batchStartTime || eventTime.getTime() - batchStartTime.getTime() > 30000) {
        // New batch - add previous batch time
        if (batchSize > 0) {
          totalTime += 30; // 30 seconds per batch
          this.addToHistory({
            id: `sub-batch-${Date.now()}-${Math.random()}`,
            type: 'substitution',
            phase: phase as 'FirstHalf' | 'SecondHalf',
            startTime: batchStartTime!.toISOString(),
            endTime: eventTime.toISOString(),
            duration: 30,
            description: `Substitution batch (${batchSize} players)`,
            timestamp: batchStartTime!.toISOString()
          });
        }
        batchStartTime = eventTime;
        batchSize = 1;
      } else {
        // Same batch - increment size
        batchSize++;
      }
    });

    // Add last batch
    if (batchSize > 0) {
      totalTime += 30;
      this.addToHistory({
        id: `sub-batch-${Date.now()}-${Math.random()}`,
        type: 'substitution',
        phase: phase as 'FirstHalf' | 'SecondHalf',
        startTime: batchStartTime!.toISOString(),
        endTime: new Date().toISOString(),
        duration: 30,
        description: `Substitution batch (${batchSize} players)`,
        timestamp: batchStartTime!.toISOString()
      });
    }

    return totalTime;
  }

  private calculateInjuryTime(events: MatchEvent[], phase: string): number {
    const systemMessages = events
      .filter(e => e.type === 'systemMessage' && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let injuryStartTime: Date | null = null;

    systemMessages.forEach((event, index) => {
      const message = event.details.message?.toLowerCase() || '';
      
      if (message.includes('injured')) {
        injuryStartTime = new Date(event.timestamp);
      } else if (injuryStartTime && (
        message.includes('safe') || 
        message.includes('resumed') ||
        message.includes('play resumed') ||
        (message.includes('suspended') && !message.includes('injured'))
      )) {
        const injuryEndTime = new Date(event.timestamp);
        const duration = Math.floor((injuryEndTime.getTime() - injuryStartTime.getTime()) / 1000);
        totalTime += duration;
        
        this.addToHistory({
          id: `injury-${Date.now()}-${Math.random()}`,
          type: 'injury',
          phase: phase as 'FirstHalf' | 'SecondHalf',
          startTime: injuryStartTime.toISOString(),
          endTime: injuryEndTime.toISOString(),
          duration,
          description: `Injury treatment`,
          timestamp: injuryStartTime.toISOString()
        });
        
        injuryStartTime = null;
      }
    });

    return totalTime;
  }

  private calculateVarTime(events: MatchEvent[], phase: string): number {
    const varEvents = events
      .filter(e => e.type === 'var' && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let varStartTime: Date | null = null;
    let varReason = '';

    varEvents.forEach(event => {
      if (event.details.isInProgress) {
        varStartTime = new Date(event.timestamp);
        varReason = event.details.reason || 'VAR Check';
      } else if (varStartTime && !event.details.isInProgress) {
        const varEndTime = new Date(event.timestamp);
        const duration = Math.floor((varEndTime.getTime() - varStartTime.getTime()) / 1000);
        totalTime += duration;
        
        this.addToHistory({
          id: `var-${Date.now()}-${Math.random()}`,
          type: 'var',
          phase: phase as 'FirstHalf' | 'SecondHalf',
          startTime: varStartTime.toISOString(),
          endTime: varEndTime.toISOString(),
          duration,
          description: `VAR Review: ${varReason}`,
          timestamp: varStartTime.toISOString()
        });
        
        varStartTime = null;
        varReason = '';
      }
    });

    return totalTime;
  }

  private calculateIncidentTime(events: MatchEvent[], phase: string): number {
    const systemMessages = events
      .filter(e => e.type === 'systemMessage' && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;
    let incidentStartTime: Date | null = null;

    systemMessages.forEach((event, index) => {
      const message = event.details.message?.toLowerCase() || '';
      
      if (message.includes('suspended') && !message.includes('injured')) {
        incidentStartTime = new Date(event.timestamp);
      } else if (incidentStartTime && (
        message.includes('resumed') ||
        message.includes('play resumed') ||
        (message.includes('suspended') && message.includes('injured')) // New injury starts
      )) {
        const incidentEndTime = new Date(event.timestamp);
        const duration = Math.floor((incidentEndTime.getTime() - incidentStartTime.getTime()) / 1000);
        totalTime += duration;
        
        this.addToHistory({
          id: `incident-${Date.now()}-${Math.random()}`,
          type: 'incident',
          phase: phase as 'FirstHalf' | 'SecondHalf',
          startTime: incidentStartTime.toISOString(),
          endTime: incidentEndTime.toISOString(),
          duration,
          description: `Incident delay`,
          timestamp: incidentStartTime.toISOString()
        });
        
        incidentStartTime = null;
      }
    });

    return totalTime;
  }

  private calculateRedCardTime(events: MatchEvent[], phase: string): number {
    const redCardEvents = events
      .filter(e => (e.type === 'redCard' || e.type === 'secondYellow') && e.phase === phase)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalTime = 0;

    redCardEvents.forEach(redCardEvent => {
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
                timestamp: delayStart.toISOString()
              });
            }
          }
        }
      }
    });

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
}