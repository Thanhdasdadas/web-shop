export interface Province {
  name: string;
  code: number;
}

export interface District {
  name: string;
  code: number;
}

export interface Ward {
  name: string;
  code: number;
}

const BASE = 'https://provinces.open-api.vn/api';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không tải được dữ liệu địa chỉ');
  return res.json() as Promise<T>;
}

export async function fetchProvinces(): Promise<Province[]> {
  try {
    return await getJson<Province[]>(`${BASE}/p/`);
  } catch {
    return FALLBACK_PROVINCES;
  }
}

export async function fetchDistricts(provinceCode: number): Promise<District[]> {
  const data = await getJson<{ districts?: District[] }>(`${BASE}/p/${provinceCode}?depth=2`);
  return data.districts ?? [];
}

export async function fetchWards(districtCode: number): Promise<Ward[]> {
  const data = await getJson<{ wards?: Ward[] }>(`${BASE}/d/${districtCode}?depth=2`);
  return data.wards ?? [];
}

const FALLBACK_PROVINCES: Province[] = [
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 38, name: 'Tỉnh Thanh Hóa' },
  { code: 46, name: 'Tỉnh Thừa Thiên Huế' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 51, name: 'Tỉnh Đồng Nai' },
  { code: 74, name: 'Tỉnh Bình Dương' },
];
