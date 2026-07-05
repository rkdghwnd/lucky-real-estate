import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitConverter } from './UnitConverter';

describe('UnitConverter', () => {
  it('fills 평 when ㎡ is typed', async () => {
    const user = userEvent.setup();
    render(<UnitConverter />);
    await user.type(screen.getByLabelText('제곱미터'), '33.06');
    expect((screen.getByLabelText('평') as HTMLInputElement).value).toBe('10');
  });
  it('fills ㎡ when 평 is typed', async () => {
    const user = userEvent.setup();
    render(<UnitConverter />);
    await user.type(screen.getByLabelText('평'), '1');
    expect((screen.getByLabelText('제곱미터') as HTMLInputElement).value).toBe('3.31');
  });
});
