import { describe, it, expect } from 'vitest';
import { generateAnonymousNickname } from './nicknames';

describe('generateAnonymousNickname', () => {
  it('should generate a nickname', () => {
    const nickname = generateAnonymousNickname();
    expect(nickname).toBeTruthy();
    expect(typeof nickname).toBe('string');
  });

  it('should contain an adjective and a noun', () => {
    const nickname = generateAnonymousNickname();
    const parts = nickname.split(' ');
    expect(parts.length).toBe(2);
  });

  it('should generate different nicknames', () => {
    const nicknames = new Set();

    // Generate 50 nicknames, should have some variety
    for (let i = 0; i < 50; i++) {
      nicknames.add(generateAnonymousNickname());
    }

    // Should have more than 1 unique nickname
    expect(nicknames.size).toBeGreaterThan(1);
  });

  it('should generate valid format', () => {
    const nickname = generateAnonymousNickname();

    // Should match pattern: "Adjective Noun"
    expect(nickname).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  });

  it('should not be empty', () => {
    const nickname = generateAnonymousNickname();
    expect(nickname.length).toBeGreaterThan(0);
  });
});
