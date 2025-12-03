import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommutePreference from './CommutePreference';

describe('CommutePreference', () => {
  it('should render with heading', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    expect(screen.getByText(/How do you plan to commute/i)).toBeTruthy();
  });

  it('should render all commute options', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    expect(screen.getByText('Car')).toBeTruthy();
    expect(screen.getByText('Public Transit')).toBeTruthy();
    expect(screen.getByText('Walk')).toBeTruthy();
    expect(screen.getByText('Bike')).toBeTruthy();
  });

  it('should allow selecting options', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    const carButton = screen.getByText('Car');
    await user.click(carButton);

    // Button should be selected (have border styling)
    expect(carButton.closest('button')?.className).toContain('border-indigo');
  });

  it('should allow selecting multiple options', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    await user.click(screen.getByText('Car'));
    await user.click(screen.getByText('Walk'));

    // Both should be selected (have border styling)
    expect(screen.getByText('Car').closest('button')?.className).toContain('border-indigo');
    expect(screen.getByText('Walk').closest('button')?.className).toContain('border-indigo');
  });

  it('should call onNext with selected options', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    await user.click(screen.getByText('Car'));
    await user.click(screen.getByText('Bike'));

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledWith(expect.arrayContaining(['car', 'bike']));
  });

  it('should disable Next button when no options selected', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should show initial options when provided', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} initialOptions={['car', 'bike']} />);

    expect(screen.getByText('Car').closest('button')?.className).toContain('border-indigo');
    expect(screen.getByText('Bike').closest('button')?.className).toContain('border-indigo');
  });

  it('should show update heading when initial options exist', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} initialOptions={['car']} />);

    expect(screen.getByText(/Update your commute preferences/i)).toBeTruthy();
  });

  it('should show current options when provided', () => {
    const onNext = vi.fn();
    render(<CommutePreference onNext={onNext} initialOptions={['car', 'walk']} />);

    expect(screen.getByText(/Current:/i)).toBeTruthy();
    expect(screen.getByText(/Car, Walk/i)).toBeTruthy();
  });

  it('should call onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(<CommutePreference onNext={onNext} onBack={onBack} />);

    const backButton = screen.getByText('Back');
    await user.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });
});
