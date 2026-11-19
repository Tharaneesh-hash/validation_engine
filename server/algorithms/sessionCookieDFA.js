/**
 * Finite-State Machine (DFA) for Session Cookie Lifecycle Management
 * 
 * Formal Definition: M = (Q, Σ, δ, q0, F)
 * - Q (States): { ISSUED, ACTIVE, EXPIRED, REVOKED }
 * - Σ (Alphabet/Events): { ACTIVATE, EXPIRE, REVOKE }
 * - q0 (Start State): ISSUED
 * - F (Accepting / Operational States): { ACTIVE }
 * - Terminal / Absorbing States: { EXPIRED, REVOKED }
 * 
 * Transition Function δ:
 *   δ(ISSUED, ACTIVATE) = ACTIVE
 *   δ(ISSUED, EXPIRE)   = EXPIRED
 *   δ(ISSUED, REVOKE)   = REVOKED
 *   δ(ACTIVE, EXPIRE)   = EXPIRED
 *   δ(ACTIVE, REVOKE)   = REVOKED
 * 
 * Illegal / Rejected Transitions:
 *   δ(EXPIRED, *) = REJECTED (Expired sessions cannot be revived)
 *   δ(REVOKED, *) = REJECTED (Revoked sessions cannot be revived)
 *   δ(ISSUED, ISSUED) = REJECTED
 *   δ(ACTIVE, ACTIVE) = REJECTED
 */

export const SESSION_STATES = {
  ISSUED: 'ISSUED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
};

export const SESSION_TRANSITIONS = {
  ISSUED: {
    ACTIVATE: 'ACTIVE',
    EXPIRE: 'EXPIRED',
    REVOKE: 'REVOKED'
  },
  ACTIVE: {
    EXPIRE: 'EXPIRED',
    REVOKE: 'REVOKED'
  },
  EXPIRED: {}, // Terminal absorbing state
  REVOKED: {}  // Terminal absorbing state
};

export class SessionCookieDFA {
  constructor(sessionId, initialMetadata = {}) {
    this.sessionId = sessionId;
    this.currentState = SESSION_STATES.ISSUED;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.expiresAt = initialMetadata.expiresAt || new Date(Date.now() + (initialMetadata.ttlSeconds || 3600) * 1000);
    this.metadata = {
      clientIp: initialMetadata.clientIp || '127.0.0.1',
      userAgent: initialMetadata.userAgent || 'Unknown',
      domain: initialMetadata.domain || 'localhost',
      path: initialMetadata.path || '/',
      ...initialMetadata
    };
    this.transitionHistory = [
      {
        fromState: null,
        toState: SESSION_STATES.ISSUED,
        event: 'CREATE',
        timestamp: this.createdAt,
        reason: 'Session cookie issued upon authentication or initial handshake.',
        success: true
      }
    ];
  }

  /**
   * Applies an input event to transition the DFA state.
   */
  transition(event, reason = '', actor = 'system') {
    const fromState = this.currentState;
    const allowedTransitions = SESSION_TRANSITIONS[fromState] || {};
    const nextState = allowedTransitions[event];

    if (!nextState) {
      const errorMsg = `Illegal DFA transition rejected: Cannot transition from ${fromState} using event ${event}.`;
      const isTerminal = fromState === SESSION_STATES.EXPIRED || fromState === SESSION_STATES.REVOKED;
      const explanation = isTerminal
        ? `State ${fromState} is a terminal absorbing state. Expired or revoked sessions can NEVER transition to any other state.`
        : `Event ${event} is not recognized for current state ${fromState}. Valid events: [${Object.keys(allowedTransitions).join(', ')}]`;

      const failedRecord = {
        fromState,
        attemptedEvent: event,
        attemptedToState: nextState || 'INVALID',
        timestamp: new Date(),
        reason: reason || errorMsg,
        explanation,
        success: false,
        actor
      };

      this.transitionHistory.push(failedRecord);

      return {
        success: false,
        currentState: this.currentState,
        attemptedEvent: event,
        error: errorMsg,
        explanation,
        transitionHistory: this.transitionHistory
      };
    }

    // Valid transition
    this.currentState = nextState;
    this.updatedAt = new Date();

    const transitionRecord = {
      fromState,
      toState: nextState,
      event,
      timestamp: this.updatedAt,
      reason: reason || `Transitioned from ${fromState} to ${nextState} via event ${event}.`,
      success: true,
      actor
    };

    this.transitionHistory.push(transitionRecord);

    return {
      success: true,
      fromState,
      toState: nextState,
      event,
      currentState: this.currentState,
      transitionHistory: this.transitionHistory
    };
  }

  /**
   * Evaluates if session should naturally expire based on current wall-clock time
   */
  checkTimeExpiration() {
    if ((this.currentState === SESSION_STATES.ISSUED || this.currentState === SESSION_STATES.ACTIVE) && new Date() > this.expiresAt) {
      return this.transition('EXPIRE', 'Automated TTL expiry: Cookie expiration timestamp exceeded.', 'time-daemon');
    }
    return { success: true, currentState: this.currentState };
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      currentState: this.currentState,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      metadata: {
        ...this.metadata,
        // Never output raw credentials
        tokenPrefix: this.sessionId.substring(0, 6) + '...'
      },
      transitionHistory: this.transitionHistory
    };
  }

  /**
   * Returns formal DFA definition graph for visualization
   */
  static getDFAGraph() {
    return {
      states: [
        { id: 'ISSUED', label: 'Issued (q0)', isInitial: true, isAccepting: false, description: 'Cookie created, pending activation' },
        { id: 'ACTIVE', label: 'Active (q1)', isInitial: false, isAccepting: true, description: 'Cookie verified and actively in use' },
        { id: 'EXPIRED', label: 'Expired (q2)', isInitial: false, isAccepting: false, isTerminal: true, description: 'Cookie TTL/Max-Age elapsed' },
        { id: 'REVOKED', label: 'Revoked (q3)', isInitial: false, isAccepting: false, isTerminal: true, description: 'Cookie manually revoked by user or admin' }
      ],
      alphabet: ['ACTIVATE', 'EXPIRE', 'REVOKE'],
      startState: 'ISSUED',
      acceptStates: ['ACTIVE'],
      transitions: [
        { from: 'ISSUED', to: 'ACTIVE', trigger: 'ACTIVATE', label: 'δ(ISSUED, ACTIVATE) = ACTIVE' },
        { from: 'ISSUED', to: 'EXPIRED', trigger: 'EXPIRE', label: 'δ(ISSUED, EXPIRE) = EXPIRED' },
        { from: 'ISSUED', to: 'REVOKED', trigger: 'REVOKE', label: 'δ(ISSUED, REVOKE) = REVOKED' },
        { from: 'ACTIVE', to: 'EXPIRED', trigger: 'EXPIRE', label: 'δ(ACTIVE, EXPIRE) = EXPIRED' },
        { from: 'ACTIVE', to: 'REVOKED', trigger: 'REVOKE', label: 'δ(ACTIVE, REVOKE) = REVOKED' }
      ]
    };
  }
}
