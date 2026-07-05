import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { NaverMap } from './NaverMap';
import { siteConfig } from '@/lib/site';

const officeAddress = '인천광역시 서구 원당대로246번길 3-1';
const originalClientId = siteConfig.naverMapClientId;

function setClientId(value: string) {
  Object.defineProperty(siteConfig, 'naverMapClientId', { configurable: true, value });
}

function installFakeNaver(addresses = [{ x: '126.675', y: '37.597' }]) {
  const FakeMap = vi.fn(function FakeMap() {});
  const FakeMarker = vi.fn(function FakeMarker() {});
  const FakeLatLng = vi.fn(function FakeLatLng(lat: number, lng: number) {
    return { lat, lng };
  });
  const fakeGeocode = vi.fn(
    (_: unknown, callback: (status: string, response: { v2: { addresses: typeof addresses } }) => void) => {
      callback('OK', { v2: { addresses } });
    },
  );

  Object.defineProperty(window, 'naver', {
    configurable: true,
    value: {
      maps: {
        LatLng: FakeLatLng,
        Map: FakeMap,
        Marker: FakeMarker,
        Service: { geocode: fakeGeocode, Status: { OK: 'OK' } },
      },
    },
  });

  return { FakeLatLng, FakeMap, FakeMarker, fakeGeocode };
}

afterEach(() => {
  setClientId(originalClientId);
  delete (window as Window & { naver?: unknown }).naver;
  delete (window as Window & { navermap_authFailure?: () => void }).navermap_authFailure;
  document.getElementById('naver-map-sdk')?.remove();
});

describe('NaverMap', () => {
  it('gives the SDK map element its own stable height', () => {
    setClientId('');
    const { container } = render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    const map = container.querySelector(`[aria-label="${officeAddress} 지도"]`);
    expect(map).toHaveClass('min-h-[360px]');
    expect(map).not.toHaveClass('absolute');
  });

  it('shows an inline error instead of an external link when the key is missing', () => {
    setClientId('');
    render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('지도를 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText(officeAddress)).toBeInTheDocument();
  });

  it('loads the geocoder submodule for address-only maps', () => {
    setClientId('test-client-id');
    render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    const script = document.getElementById('naver-map-sdk') as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain('ncpKeyId=test-client-id');
    expect(script?.src).toContain('submodules=geocoder');
  });

  it('waits for the geocoder submodule after the base SDK load event', async () => {
    setClientId('test-client-id');
    render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    const script = document.getElementById('naver-map-sdk') as HTMLScriptElement;
    act(() => script.dispatchEvent(new Event('load')));
    const { FakeMap, FakeMarker, fakeGeocode } = installFakeNaver();

    await waitFor(() => expect(fakeGeocode).toHaveBeenCalledTimes(1));
    expect(FakeMap).toHaveBeenCalledTimes(1);
    expect(FakeMarker).toHaveBeenCalledTimes(1);
  });

  it('geocodes an address and creates one marker', async () => {
    setClientId('test-client-id');
    const { FakeLatLng, FakeMap, FakeMarker, fakeGeocode } = installFakeNaver();

    render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    await waitFor(() => {
      expect(fakeGeocode).toHaveBeenCalledWith({ query: officeAddress }, expect.any(Function));
    });
    expect(FakeLatLng).toHaveBeenCalledWith(37.597, 126.675);
    expect(FakeMap).toHaveBeenCalledTimes(1);
    expect(FakeMarker).toHaveBeenCalledTimes(1);
  });

  it('reports valid geocoded coordinates to an optional consumer', async () => {
    setClientId('test-client-id');
    installFakeNaver();
    const onResolved = vi.fn();

    render(<NaverMap lat={null} lng={null} address={officeAddress} onResolved={onResolved} />);

    await waitFor(() => expect(onResolved).toHaveBeenCalledWith({ lat: 37.597, lng: 126.675 }));
  });

  it('keeps direct coordinate maps compatible', async () => {
    setClientId('test-client-id');
    const { FakeLatLng, FakeMap, FakeMarker, fakeGeocode } = installFakeNaver();

    render(<NaverMap lat={37.5} lng={126.6} address="인천 서구 오류동 000" />);

    await waitFor(() => expect(FakeMap).toHaveBeenCalledTimes(1));
    expect(FakeLatLng).toHaveBeenCalledWith(37.5, 126.6);
    expect(FakeMarker).toHaveBeenCalledTimes(1);
    expect(fakeGeocode).not.toHaveBeenCalled();
  });

  it('shows an inline error when NAVER reports an authentication failure', async () => {
    setClientId('test-client-id');
    installFakeNaver();

    render(<NaverMap lat={37.5} lng={126.6} address="인천 서구 오류동 000" />);
    act(() => (window as Window & { navermap_authFailure?: () => void }).navermap_authFailure?.());

    expect(await screen.findByText('지도를 불러오지 못했습니다')).toBeInTheDocument();
  });

  it('shows an inline error when geocoding returns no address', async () => {
    setClientId('test-client-id');
    const { FakeMap } = installFakeNaver([]);

    render(<NaverMap lat={null} lng={null} address={officeAddress} />);

    expect(await screen.findByText('지도를 불러오지 못했습니다')).toBeInTheDocument();
    expect(FakeMap).not.toHaveBeenCalled();
  });
});
