import { z } from 'zod';

const propertyTypes = ['공장', '창고', '토지', '기타'] as const;
const dealTypes = ['매매', '임대'] as const;
const currentYear = new Date().getFullYear();

const nullableText = z.preprocess(
  value => typeof value === 'string' && value.trim() === '' ? null : value,
  z.string().trim().nullable(),
);

const optionalPositiveNumber = z.number().finite().positive().nullable();

const writableFields = {
  title: z.string().trim().min(2, '매물 제목을 2자 이상 입력해주세요.').max(80, '매물 제목은 80자까지 입력할 수 있습니다.'),
  propertyType: z.enum(propertyTypes, { message: '매물 종류를 선택해주세요.' }),
  dealType: z.enum(dealTypes, { message: '거래 유형을 선택해주세요.' }),
  status: z.enum(['공개', '거래완료'], { message: '상태를 선택해주세요.' }),
  address: z.string().trim().min(5, '주소를 5자 이상 입력해주세요.').max(200, '주소는 200자까지 입력할 수 있습니다.'),
  addressPublic: z.boolean(),
  price: z.number().finite().nonnegative('가격은 0 이상이어야 합니다.'),
  monthlyRent: z.number().finite().nonnegative().nullable(),
  landAreaM2: optionalPositiveNumber,
  buildingAreaM2: optionalPositiveNumber,
  zoning: nullableText,
  landCategory: nullableText,
  roadAccess: nullableText,
  ceilingHeightM: optionalPositiveNumber,
  powerCapacity: nullableText,
  completionYear: z.number().int().min(1900).max(currentYear + 1).nullable(),
  lat: z.number().finite().min(-90).max(90).nullable(),
  lng: z.number().finite().min(-180).max(180).nullable(),
  description: z.preprocess(
    value => typeof value === 'string' && value.trim() === '' ? null : value,
    z.string().trim().max(5000, '설명은 5,000자까지 입력할 수 있습니다.').nullable(),
  ),
};

function validateDeal(
  value: { dealType: '매매' | '임대'; price: number; monthlyRent: number | null },
  context: z.RefinementCtx,
) {
  if (value.dealType === '매매' && value.price <= 0) {
    context.addIssue({ code: 'custom', path: ['price'], message: '매매가를 입력해주세요.' });
  }
  if (value.dealType === '매매' && value.monthlyRent != null) {
    context.addIssue({ code: 'custom', path: ['monthlyRent'], message: '매매 매물에는 월세를 입력할 수 없습니다.' });
  }
  if (value.dealType === '임대' && (value.monthlyRent == null || value.monthlyRent <= 0)) {
    context.addIssue({ code: 'custom', path: ['monthlyRent'], message: '월세를 입력해주세요.' });
  }
}

const listingFieldsSchema = z.object(writableFields).strict().superRefine(validateDeal);

export const listingPayloadSchema = z.object({
  id: z.string().uuid('매물 ID가 올바르지 않습니다.'),
  ...writableFields,
  images: z.array(z.string().trim().min(1)).min(1, '사진을 한 장 이상 등록해주세요.').max(20, '사진은 최대 20장까지 등록할 수 있습니다.'),
}).strict().superRefine(validateDeal);

export type ListingPayload = z.infer<typeof listingPayloadSchema>;

export type ListingFormParseResult =
  | { success: true; data: Omit<ListingPayload, 'id' | 'images'> }
  | { success: false; fieldErrors: Record<string, string> };

function normalizedNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') return Number.NaN;
  const normalized = value.replaceAll(',', '').trim();
  return normalized === '' ? Number.NaN : Number(normalized);
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const number = normalizedNumber(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

function textValue(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value : '';
}

export function manwonToWon(value: FormDataEntryValue | null): number {
  const manwon = normalizedNumber(value);
  return Number.isFinite(manwon) ? manwon * 10_000 : Number.NaN;
}

export function wonToManwon(value: number | null): string {
  return value == null || !Number.isFinite(value) ? '' : String(value / 10_000);
}

export function parseListingForm(form: FormData): ListingFormParseResult {
  const dealType = textValue(form, 'dealType');
  const monthlyRentValue = form.get('monthlyRentManwon');
  const parsed = listingFieldsSchema.safeParse({
    title: textValue(form, 'title'),
    propertyType: textValue(form, 'propertyType'),
    dealType,
    status: textValue(form, 'status'),
    address: textValue(form, 'address'),
    addressPublic: form.get('addressPublic') === 'true',
    price: manwonToWon(form.get('priceManwon')),
    monthlyRent: dealType === '매매'
      ? null
      : typeof monthlyRentValue !== 'string' || monthlyRentValue.trim() === ''
        ? null
        : manwonToWon(monthlyRentValue),
    landAreaM2: optionalNumber(form.get('landAreaM2')),
    buildingAreaM2: optionalNumber(form.get('buildingAreaM2')),
    zoning: textValue(form, 'zoning'),
    landCategory: textValue(form, 'landCategory'),
    roadAccess: textValue(form, 'roadAccess'),
    ceilingHeightM: optionalNumber(form.get('ceilingHeightM')),
    powerCapacity: textValue(form, 'powerCapacity'),
    completionYear: optionalNumber(form.get('completionYear')),
    lat: optionalNumber(form.get('lat')),
    lng: optionalNumber(form.get('lng')),
    description: textValue(form, 'description'),
  });

  if (parsed.success) return { success: true, data: parsed.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    fieldErrors[field] ??= issue.message;
  }
  return { success: false, fieldErrors };
}
