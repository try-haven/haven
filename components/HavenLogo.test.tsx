import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import HavenLogo from './HavenLogo';

describe('HavenLogo', () => {
  it('should render without crashing', () => {
    const { container } = render(<HavenLogo />);
    expect(container).toBeTruthy();
  });

  it('should render with small size', () => {
    const { container } = render(<HavenLogo size="sm" />);
    const logo = container.querySelector('.w-12');
    expect(logo).toBeTruthy();
  });

  it('should render with medium size by default', () => {
    const { container } = render(<HavenLogo />);
    const logo = container.querySelector('.w-24');
    expect(logo).toBeTruthy();
  });

  it('should render with large size', () => {
    const { container } = render(<HavenLogo size="lg" />);
    const logo = container.querySelector('.w-32');
    expect(logo).toBeTruthy();
  });

  it('should show animation by default', () => {
    const { container } = render(<HavenLogo />);
    const animation = container.querySelector('.animate-ping');
    expect(animation).toBeTruthy();
  });

  it('should hide animation when showAnimation is false', () => {
    const { container } = render(<HavenLogo showAnimation={false} />);
    const animation = container.querySelector('.animate-ping');
    expect(animation).toBeFalsy();
  });

  it('should render house icon', () => {
    const { container } = render(<HavenLogo />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
