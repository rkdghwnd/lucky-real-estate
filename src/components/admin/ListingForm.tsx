'use client';

import { useCallback, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Images, MapPin, Ruler, Save, WalletCards } from 'lucide-react';
import {
  createListingAction,
  updateListingAction,
  type AdminActionResult,
} from '@/app/admin/actions';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { NaverMap } from '@/components/map/NaverMap';
import { Button } from '@/components/ui/button';
import {
  cleanupListingImages,
  ListingImageUploadError,
  uploadPendingImages,
  type ListingImageItem,
  type StoredListingImage,
} from '@/lib/admin/images';
import { listingPayloadSchema, parseListingForm } from '@/lib/admin/listing-schema';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { DealType, PropertyType } from '@/lib/types';

export interface ListingFormInitialValues {
  title?: string;
  propertyType?: PropertyType;
  dealType?: DealType;
  address?: string;
  priceManwon?: string;
  monthlyRentManwon?: string;
  landAreaM2?: string;
  buildingAreaM2?: string;
  zoning?: string;
  landCategory?: string;
  roadAccess?: string;
  ceilingHeightM?: string;
  powerCapacity?: string;
  completionYear?: string;
  lat?: number | null;
  lng?: number | null;
  description?: string;
}

type SaveResult = AdminActionResult<{ id: string; slug: string }>;
type UploadFn = typeof uploadPendingImages;
type CleanupFn = typeof cleanupListingImages;

interface ListingFormProps {
  mode: 'create' | 'edit';
  listingId?: string;
  initialValues?: ListingFormInitialValues;
  initialImages?: StoredListingImage[];
  getClient?: typeof createBrowserSupabaseClient;
  uploadImages?: UploadFn;
  cleanupImages?: CleanupFn;
  createAction?: (input: unknown) => Promise<SaveResult>;
  updateAction?: (id: string, input: unknown) => Promise<SaveResult>;
}

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-hairline bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-100';
const textAreaClass = 'mt-2 min-h-40 w-full resize-y rounded-xl border border-hairline bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-100';

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex gap-3 border-b border-hairline pb-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand">{icon}</span>
        <div>
          <h2 className="text-xl font-black text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ErrorText({ error, id }: { error?: string; id: string }) {
  return error ? <p id={id} className="mt-2 text-sm font-semibold text-danger">{error}</p> : null;
}

function wonPreview(value: string) {
  const normalized = Number(value.replaceAll(',', '').trim());
  if (!Number.isFinite(normalized) || normalized <= 0) return '';
  return `${(normalized * 10_000).toLocaleString('ko-KR')}원`;
}

function pyeongPreview(value: string) {
  const squareMeters = Number(value.replaceAll(',', '').trim());
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) return '';
  return `약 ${(squareMeters / 3.3058).toFixed(1)}평`;
}

const errorFieldOrder = [
  'title',
  'propertyType',
  'dealType',
  'address',
  'price',
  'monthlyRent',
  'landAreaM2',
  'buildingAreaM2',
  'completionYear',
  'images',
];

export function ListingForm({
  mode,
  listingId,
  initialValues = {},
  initialImages = [],
  getClient = createBrowserSupabaseClient,
  uploadImages = uploadPendingImages,
  cleanupImages = cleanupListingImages,
  createAction = createListingAction,
  updateAction = updateListingAction,
}: ListingFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const idRef = useRef(listingId ?? globalThis.crypto.randomUUID());
  const initialPathsRef = useRef(initialImages.map(image => image.path));
  const [dealType, setDealType] = useState<DealType>(initialValues.dealType ?? '매매');
  const [priceManwon, setPriceManwon] = useState(initialValues.priceManwon ?? '');
  const [monthlyRentManwon, setMonthlyRentManwon] = useState(initialValues.monthlyRentManwon ?? '');
  const [landAreaM2, setLandAreaM2] = useState(initialValues.landAreaM2 ?? '');
  const [buildingAreaM2, setBuildingAreaM2] = useState(initialValues.buildingAreaM2 ?? '');
  const [address, setAddress] = useState(initialValues.address ?? '');
  const [coordinates, setCoordinates] = useState({ lat: initialValues.lat ?? null, lng: initialValues.lng ?? null });
  const [images, setImages] = useState<ListingImageItem[]>(initialImages);
  const [imageStatuses, setImageStatuses] = useState<Record<string, 'uploading' | 'done' | 'failed'>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);

  const handleResolved = useCallback((position: { lat: number; lng: number }) => {
    setCoordinates(position);
  }, []);

  function focusFirstError(errors: Record<string, string>) {
    const key = errorFieldOrder.find(field => errors[field]) ?? Object.keys(errors)[0];
    if (!key || !formRef.current) return;
    const names: Record<string, string> = { price: 'priceManwon', monthlyRent: 'monthlyRentManwon' };
    const selector = key === 'images'
      ? '[aria-label="매물 사진 선택"]'
      : `[name="${names[key] ?? key}"]`;
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(selector)?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setSubmitError('');
    const parsed = parseListingForm(new FormData(event.currentTarget));
    const errors = parsed.success ? {} : { ...parsed.fieldErrors };
    if (images.length === 0) errors.images = '사진을 한 장 이상 등록해주세요.';
    if (!parsed.success || Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      focusFirstError(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);
    let client;
    let newlyUploaded: string[] = [];
    try {
      client = getClient();
      const upload = await uploadImages(client, idRef.current, images, (id, status) => {
        setImageStatuses(current => ({ ...current, [id]: status }));
      });
      newlyUploaded = upload.uploadedPaths;
      const payload = listingPayloadSchema.parse({
        id: idRef.current,
        ...parsed.data,
        images: upload.paths,
      });
      const result = mode === 'create'
        ? await createAction(payload)
        : await updateAction(idRef.current, payload);
      if (!result.ok) {
        await cleanupImages(client, newlyUploaded);
        setSubmitError(result.message);
        return;
      }

      if (mode === 'edit') {
        const retained = new Set(upload.paths);
        const removedStoredPaths = initialPathsRef.current.filter(path => !retained.has(path));
        await cleanupImages(client, removedStoredPaths);
      }
      router.replace(`/admin?${mode === 'create' ? 'created' : 'updated'}=1`);
      router.refresh();
    } catch (error) {
      const uploadedPaths = error instanceof ListingImageUploadError ? error.uploadedPaths : newlyUploaded;
      if (client && uploadedPaths.length > 0) await cleanupImages(client, uploadedPaths);
      setSubmitError(error instanceof ListingImageUploadError
        ? '일부 사진을 올리지 못했습니다. 네트워크를 확인하고 다시 시도해주세요.'
        : '매물을 저장하지 못했습니다. 입력 내용은 유지되니 다시 시도해주세요.');
    } finally {
      setPending(false);
    }
  }

  function changeAddress(value: string) {
    setAddress(value);
    setCoordinates({ lat: null, lng: null });
  }

  const priceLabel = dealType === '매매' ? '매매가(만원)' : '보증금(만원)';

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="pb-28">
      <div className="space-y-6">
        {submitError ? (
          <div role="alert" aria-label="저장 오류" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-danger">
            {submitError}
          </div>
        ) : null}

        <Section icon={<Building2 aria-hidden="true" />} title="기본 정보" description="사이트에 표시될 매물의 기본 내용을 입력합니다.">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="font-bold text-ink">매물 제목 <span className="text-danger">*</span></span>
              <input
                name="title"
                aria-label="매물 제목"
                defaultValue={initialValues.title ?? ''}
                placeholder="예: 오류동 진입 좋은 제조공장"
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? 'title-error' : undefined}
                className={inputClass}
              />
              <ErrorText id="title-error" error={fieldErrors.title} />
            </label>
            <label className="block">
              <span className="font-bold text-ink">매물 종류 <span className="text-danger">*</span></span>
              <select name="propertyType" aria-label="매물 종류" defaultValue={initialValues.propertyType ?? '공장'} className={inputClass} aria-invalid={Boolean(fieldErrors.propertyType)}>
                <option value="공장">공장</option>
                <option value="창고">창고</option>
                <option value="토지">토지</option>
                <option value="기타">기타</option>
              </select>
              <ErrorText id="property-type-error" error={fieldErrors.propertyType} />
            </label>
            <label className="block">
              <span className="font-bold text-ink">거래 유형 <span className="text-danger">*</span></span>
              <select name="dealType" aria-label="거래 유형" value={dealType} onChange={event => setDealType(event.target.value as DealType)} className={inputClass}>
                <option value="매매">매매</option>
                <option value="임대">임대</option>
              </select>
              <ErrorText id="deal-type-error" error={fieldErrors.dealType} />
            </label>
            <label className="block lg:col-span-2">
              <span className="font-bold text-ink">주소 <span className="text-danger">*</span></span>
              <input
                name="address"
                aria-label="주소"
                value={address}
                onChange={event => changeAddress(event.target.value)}
                placeholder="도로명 또는 지번 주소"
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                className={inputClass}
              />
              <ErrorText id="address-error" error={fieldErrors.address} />
            </label>
          </div>
        </Section>

        <Section icon={<WalletCards aria-hidden="true" />} title="가격 정보" description="가격은 만원 단위로 입력하며 사이트에는 읽기 쉽게 표시됩니다.">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="font-bold text-ink">{priceLabel} <span className="text-danger">*</span></span>
              <input
                name="priceManwon"
                aria-label={priceLabel}
                inputMode="numeric"
                value={priceManwon}
                onChange={event => setPriceManwon(event.target.value)}
                placeholder="예: 185000"
                aria-invalid={Boolean(fieldErrors.price)}
                aria-describedby="price-preview price-error"
                className={inputClass}
              />
              <p id="price-preview" className="mt-2 min-h-5 text-sm font-semibold text-brand">{wonPreview(priceManwon)}</p>
              <ErrorText id="price-error" error={fieldErrors.price} />
            </label>
            {dealType === '임대' ? (
              <label className="block">
                <span className="font-bold text-ink">월세(만원) <span className="text-danger">*</span></span>
                <input
                  name="monthlyRentManwon"
                  aria-label="월세(만원)"
                  inputMode="numeric"
                  value={monthlyRentManwon}
                  onChange={event => setMonthlyRentManwon(event.target.value)}
                  placeholder="예: 500"
                  aria-invalid={Boolean(fieldErrors.monthlyRent)}
                  aria-describedby="rent-preview rent-error"
                  className={inputClass}
                />
                <p id="rent-preview" className="mt-2 min-h-5 text-sm font-semibold text-brand">{wonPreview(monthlyRentManwon)}</p>
                <ErrorText id="rent-error" error={fieldErrors.monthlyRent} />
              </label>
            ) : null}
          </div>
        </Section>

        <Section icon={<Ruler aria-hidden="true" />} title="면적 정보" description="㎡를 입력하면 익숙한 평 단위도 함께 계산합니다.">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="font-bold text-ink">대지면적(㎡)</span>
              <input name="landAreaM2" aria-label="대지면적(㎡)" inputMode="decimal" value={landAreaM2} onChange={event => setLandAreaM2(event.target.value)} className={inputClass} aria-invalid={Boolean(fieldErrors.landAreaM2)} />
              <p className="mt-2 min-h-5 text-sm font-semibold text-brand">{pyeongPreview(landAreaM2)}</p>
              <ErrorText id="land-area-error" error={fieldErrors.landAreaM2} />
            </label>
            <label className="block">
              <span className="font-bold text-ink">건물면적(㎡)</span>
              <input name="buildingAreaM2" aria-label="건물면적(㎡)" inputMode="decimal" value={buildingAreaM2} onChange={event => setBuildingAreaM2(event.target.value)} className={inputClass} aria-invalid={Boolean(fieldErrors.buildingAreaM2)} />
              <p className="mt-2 min-h-5 text-sm font-semibold text-brand">{pyeongPreview(buildingAreaM2)}</p>
              <ErrorText id="building-area-error" error={fieldErrors.buildingAreaM2} />
            </label>
          </div>
        </Section>

        <Section icon={<Building2 aria-hidden="true" />} title="상세 정보" description="확인된 항목만 입력해도 됩니다. 비어 있는 항목은 사이트에서 숨겨집니다.">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <label className="block"><span className="font-bold text-ink">용도지역</span><input name="zoning" aria-label="용도지역" defaultValue={initialValues.zoning ?? ''} className={inputClass} /></label>
            <label className="block"><span className="font-bold text-ink">지목</span><input name="landCategory" aria-label="지목" defaultValue={initialValues.landCategory ?? ''} className={inputClass} /></label>
            <label className="block"><span className="font-bold text-ink">도로 조건</span><input name="roadAccess" aria-label="도로 조건" defaultValue={initialValues.roadAccess ?? ''} className={inputClass} /></label>
            <label className="block"><span className="font-bold text-ink">층고(m)</span><input name="ceilingHeightM" aria-label="층고(m)" inputMode="decimal" defaultValue={initialValues.ceilingHeightM ?? ''} className={inputClass} aria-invalid={Boolean(fieldErrors.ceilingHeightM)} /></label>
            <label className="block"><span className="font-bold text-ink">전력 용량</span><input name="powerCapacity" aria-label="전력 용량" defaultValue={initialValues.powerCapacity ?? ''} placeholder="예: 150kW" className={inputClass} /></label>
            <label className="block"><span className="font-bold text-ink">준공연도</span><input name="completionYear" aria-label="준공연도" inputMode="numeric" defaultValue={initialValues.completionYear ?? ''} className={inputClass} aria-invalid={Boolean(fieldErrors.completionYear)} /><ErrorText id="completion-year-error" error={fieldErrors.completionYear} /></label>
            <label className="block md:col-span-2 xl:col-span-3">
              <span className="font-bold text-ink">상세 설명</span>
              <textarea name="description" aria-label="상세 설명" defaultValue={initialValues.description ?? ''} maxLength={5000} placeholder="입지, 진입 여건, 시설 상태 등 매물의 장점을 입력해주세요." className={textAreaClass} />
              <ErrorText id="description-error" error={fieldErrors.description} />
            </label>
          </div>
        </Section>

        <Section icon={<Images aria-hidden="true" />} title="사진" description="드래그 대신 화살표로 순서를 바꿀 수 있습니다.">
          <ImageUploader
            items={images}
            onChange={setImages}
            errors={fieldErrors.images ? [fieldErrors.images] : []}
            statuses={imageStatuses}
            disabled={pending}
          />
        </Section>

        <Section icon={<MapPin aria-hidden="true" />} title="위치 확인" description="주소를 바탕으로 위치를 확인합니다. 지도가 실패해도 저장할 수 있습니다.">
          <input type="hidden" name="lat" value={coordinates.lat ?? ''} readOnly />
          <input type="hidden" name="lng" value={coordinates.lng ?? ''} readOnly />
          {address.trim().length >= 5 ? (
            <NaverMap lat={coordinates.lat} lng={coordinates.lng} address={address} onResolved={handleResolved} />
          ) : (
            <div className="grid min-h-48 place-items-center rounded-2xl bg-brand-light px-5 text-center text-sm font-semibold text-muted">주소를 입력하면 위치를 확인할 수 있습니다.</div>
          )}
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 shadow-[0_-8px_30px_rgba(10,11,13,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
          <p className="hidden text-sm font-semibold text-muted sm:block">저장하면 공개 사이트에 즉시 반영됩니다.</p>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin')} disabled={pending} aria-label="목록으로 취소">
              <ArrowLeft aria-hidden="true" /> 취소
            </Button>
            <Button type="submit" disabled={pending}>
              <Save aria-hidden="true" />
              {pending ? '사진 처리 중…' : mode === 'create' ? '저장하고 바로 공개' : '수정 내용 저장'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export type { ListingFormProps };
