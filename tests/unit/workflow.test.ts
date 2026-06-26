import { canTransition } from "@/services/workflow";
import { ApplicationStatus } from "@/models/models";

describe('Workflow', () => {
  it('should allow valid transitions', () => {
    // Happy path
    expect(canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(canTransition('UNDER_REVIEW', 'APPROVED')).toBe(true);
    expect(canTransition('UNDER_REVIEW', 'REJECTED')).toBe(true);
    // Return for changes
    expect(canTransition('UNDER_REVIEW', 'DRAFT')).toBe(true);
  });

  it('should not allow invalid transitions', () => {
    // Skip states
    expect(canTransition('DRAFT', 'APPROVED')).toBe(false);
    expect(canTransition('SUBMITTED', 'APPROVED')).toBe(false);
    
    // Backward except for UNDER_REVIEW → DRAFT
    expect(canTransition('SUBMITTED', 'DRAFT')).toBe(false);
    expect(canTransition('APPROVED', 'REJECTED')).toBe(false);
    expect(canTransition('REJECTED', 'SUBMITTED')).toBe(false);
    
    // Final states
    expect(canTransition('APPROVED', 'ANYTHING')).toBe(false);
    expect(canTransition('REJECTED', 'DRAFT')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(canTransition('DRAFT', 'DRAFT')).toBe(false);
    //expect(canTransition('INVALID', 'DRAFT')).toBe(false);
    //expect(canTransition('', 'DRAFT')).toBe(false);
  });
});