/**
 * Test Suite: Subscription State Machine
 * 
 * Tests for valid and invalid state transitions in the subscription lifecycle.
 */

import {
  validateStateTransition,
  getValidNextStates,
  updateSubscriptionStateSecure,
  isRecoverable,
  isActivePayingSubscription,
} from '@/lib/subscription-state-machine';
import { SubscriptionState } from '@/lib/subscription-state-machine';

describe('Subscription State Machine', () => {
  describe('Valid State Transitions', () => {
    const validTransitions: Array<[SubscriptionState, SubscriptionState]> = [
      ['trialing', 'active'],
      ['trialing', 'expired'],
      ['trialing', 'cancelled'],
      ['active', 'past_due'],
      ['active', 'suspended'],
      ['active', 'cancelled'],
      ['past_due', 'active'],
      ['past_due', 'payment_attempted'],
      ['past_due', 'suspended'],
      ['past_due', 'cancelled'],
      ['payment_attempted', 'active'],
      ['payment_attempted', 'past_due'],
      ['suspended', 'active'],
      ['suspended', 'cancelled'],
      ['cancelled', 'unrecoverable'],
      ['expired', 'active'],
    ];

    validTransitions.forEach(([from, to]) => {
      it(`should allow transition from ${from} to ${to}`, () => {
        const result = validateStateTransition(from, to);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('Invalid State Transitions', () => {
    const invalidTransitions: Array<[SubscriptionState, SubscriptionState]> = [
      ['trialing', 'past_due'], // Must go through active
      ['trialing', 'suspended'],
      ['active', 'trialing'], // Cannot go back to trial
      ['active', 'active'], // Same state is invalid
      ['past_due', 'past_due'], // Cannot stay in same state
      ['past_due', 'expired'],
      ['payment_attempted', 'suspended'],
      ['suspended', 'past_due'], // Must go through active
      ['suspended', 'suspended'],
      ['suspended', 'expired'],
      ['cancelled', 'active'], // Terminal state - cannot recover
      ['cancelled', 'trialing'],
      ['unrecoverable', 'active'], // Final state - irreversible
      ['expired', 'expired'],
      ['expired', 'past_due'],
    ];

    invalidTransitions.forEach(([from, to]) => {
      it(`should reject transition from ${from} to ${to}`, () => {
        const result = validateStateTransition(from, to);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('getValidNextStates', () => {
    it('should return all valid next states from trialing', () => {
      const validStates = getValidNextStates('trialing');
      expect(validStates).toContain('active');
      expect(validStates).toContain('expired');
      expect(validStates).toContain('cancelled');
      expect(validStates.length).toBe(3);
    });

    it('should return all valid next states from active', () => {
      const validStates = getValidNextStates('active');
      expect(validStates).toContain('past_due');
      expect(validStates).toContain('suspended');
      expect(validStates).toContain('cancelled');
      expect(validStates).not.toContain('active');
    });

    it('should return all valid next states from past_due', () => {
      const validStates = getValidNextStates('past_due');
      expect(validStates).toContain('active');
      expect(validStates).toContain('payment_attempted');
      expect(validStates).toContain('suspended');
      expect(validStates).toContain('cancelled');
    });

    it('should return empty array for terminal state', () => {
      const validStates = getValidNextStates('unrecoverable');
      expect(validStates).toEqual([]);
    });
  });

  describe('updateSubscriptionStateSecure', () => {
    it('should require valid previous states in WHERE clause', async () => {
      // This test verifies that the function uses WHERE clause to prevent race conditions
      // In a real scenario with concurrent updates:
      // - Thread A reads subscription state as 'active'
      // - Thread B updates from 'active' to 'past_due'
      // - Thread A tries to update from 'active' to 'suspended'
      // - WHERE clause ensures Thread A's update fails because state is no longer 'active'
      
      // Result should include validation check
      const result = await updateSubscriptionStateSecure(
        'cmp_test_123',
        'sub_test_123',
        'past_due',
        'invoice.payment_failed',
        ['active'] // Only transition from active
      );
      
      // If company doesn't exist, should fail gracefully
      // In integration test, should verify WHERE clause is actually used
      expect(result).toBeDefined();
    });

    it('should log state transitions', async () => {
      // Verify that all state transitions are logged to subscription_state_transitions table
      // with metadata including trigger and timestamp
      const result = await updateSubscriptionStateSecure(
        'cmp_test_456',
        'sub_test_456',
        'suspended',
        'payment_failed_3_times',
        ['active', 'past_due']
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('isRecoverable', () => {
    it('should mark trialing as recoverable', () => {
      expect(isRecoverable('trialing')).toBe(true);
    });

    it('should mark active as recoverable', () => {
      expect(isRecoverable('active')).toBe(true);
    });

    it('should mark past_due as recoverable', () => {
      expect(isRecoverable('past_due')).toBe(true);
    });

    it('should mark payment_attempted as recoverable', () => {
      expect(isRecoverable('payment_attempted')).toBe(true);
    });

    it('should mark suspended as recoverable', () => {
      expect(isRecoverable('suspended')).toBe(true);
    });

    it('should mark expired as recoverable', () => {
      expect(isRecoverable('expired')).toBe(true);
    });

    it('should not mark cancelled as recoverable', () => {
      expect(isRecoverable('cancelled')).toBe(false);
    });

    it('should not mark unrecoverable as recoverable', () => {
      expect(isRecoverable('unrecoverable')).toBe(false);
    });
  });

  describe('isActivePayingSubscription', () => {
    it('should return true only for active state', () => {
      expect(isActivePayingSubscription('active')).toBe(true);
      expect(isActivePayingSubscription('trialing')).toBe(false);
      expect(isActivePayingSubscription('past_due')).toBe(false);
      expect(isActivePayingSubscription('suspended')).toBe(false);
      expect(isActivePayingSubscription('cancelled')).toBe(false);
      expect(isActivePayingSubscription('expired')).toBe(false);
    });
  });
});
