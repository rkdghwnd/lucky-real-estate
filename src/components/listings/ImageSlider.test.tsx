import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageSlider } from './ImageSlider';

describe('ImageSlider', () => {
  it('shows a placeholder when there are no images', () => {
    render(<ImageSlider images={[]} alt="매물" />);
    expect(screen.getByText('사진 준비중')).toBeInTheDocument();
  });

  it('renders each image as a carousel slide', () => {
    render(<ImageSlider images={['/a.jpg', '/b.jpg']} alt="매물" />);
    expect(screen.getAllByAltText('매물 사진 1').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('매물 사진 2').length).toBeGreaterThan(0);
  });
});
