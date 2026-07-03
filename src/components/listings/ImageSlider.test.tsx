import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageSlider } from './ImageSlider';

describe('ImageSlider', () => {
  it('shows a placeholder when there are no images', () => {
    render(<ImageSlider images={[]} alt="매물" />);
    expect(screen.getByText('사진 준비중')).toBeInTheDocument();
  });
  it('advances to the next image', async () => {
    const user = userEvent.setup();
    render(<ImageSlider images={['/a.jpg', '/b.jpg']} alt="매물" />);
    expect(screen.getByAltText('매물 사진 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByAltText('매물 사진 2')).toBeInTheDocument();
  });
});
