---
title: Shared office map
date: 2026-07-04
status: approved
---

# Shared Office Map

## Goal

Render a NAVER map centered on `인천광역시 서구 원당대로246번길 3-1` with one office marker on both the home and company introduction pages.

## Architecture

- Replace the address-link fallback in `NaverMap` with a reusable office-map mode driven by an address.
- Load the NAVER Maps JavaScript SDK once with the `geocoder` submodule.
- Geocode `siteConfig.address` in the browser, use the first result as the map center, and create one marker at that coordinate.
- Reuse the same component on the company introduction page and in the home page's existing map region.
- Keep listing-detail maps compatible with their existing latitude and longitude props.

## States

- Loading: show a stable map-sized loading surface.
- Ready: show the interactive map at zoom 16 or 17 with one marker.
- Missing key, geocoding failure, or empty result: show the office address and a concise map-unavailable message without an external map link.

## Testing

- Test that address-only mode renders a map container instead of the old external link.
- Test SDK loading includes the `geocoder` submodule.
- Test geocoding success creates a map and one marker.
- Test the error state when geocoding returns no result.
- Run the full test suite, lint, production build, and browser verification on desktop and mobile.

## External Requirement

The configured legacy NAVER Maps Client ID is loaded with `ncpClientId`. Its application must allow the deployed and local web service URLs and have Web Dynamic Map and Geocoding enabled. Geocoding consumes the application's quota.

## References

- https://navermaps.github.io/maps.js.ncp/docs/tutorial-Geocoder-Geocoding.html
- https://navermaps.github.io/maps.js.ncp/docs/tutorial-4-Submodules.html
