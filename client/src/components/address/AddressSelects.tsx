import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import { fetchDistricts, fetchProvinces, fetchWards } from '@/lib/vietnamAddress';

export interface CheckoutAddressForm {
  fullName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district: string;
  city: string;
  note?: string;
}

interface Props {
  setValue: UseFormSetValue<CheckoutAddressForm>;
  errors: FieldErrors<CheckoutAddressForm>;
  values: { city: string; district: string; ward: string };
}

export function AddressSelects({ setValue, errors, values }: Props) {
  const [provinceCode, setProvinceCode] = useState<number | ''>('');
  const [districtCode, setDistrictCode] = useState<number | ''>('');

  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ['vn-provinces'],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: districts = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ['vn-districts', provinceCode],
    queryFn: () => fetchDistricts(provinceCode as number),
    enabled: provinceCode !== '',
  });

  const { data: wards = [], isLoading: loadingWards } = useQuery({
    queryKey: ['vn-wards', districtCode],
    queryFn: () => fetchWards(districtCode as number),
    enabled: districtCode !== '',
  });

  useEffect(() => {
    if (!values.city || provinceCode !== '') return;
    const match = provinces.find((p) => p.name === values.city);
    if (match) setProvinceCode(match.code);
  }, [provinces, values.city, provinceCode]);

  const onProvinceChange = (code: number | '') => {
    setProvinceCode(code);
    setDistrictCode('');
    const name = code === '' ? '' : provinces.find((p) => p.code === code)?.name ?? '';
    setValue('city', name, { shouldValidate: true });
    setValue('district', '', { shouldValidate: true });
    setValue('ward', '', { shouldValidate: true });
  };

  const onDistrictChange = (code: number | '') => {
    setDistrictCode(code);
    const name = code === '' ? '' : districts.find((d) => d.code === code)?.name ?? '';
    setValue('district', name, { shouldValidate: true });
    setValue('ward', '', { shouldValidate: true });
  };

  const onWardChange = (code: number | '') => {
    const name = code === '' ? '' : wards.find((w) => w.code === code)?.name ?? '';
    setValue('ward', name, { shouldValidate: true });
  };

  const wardCode = wards.find((w) => w.name === values.ward)?.code ?? '';

  return (
    <div className="grid gap-3">
      <Select
        label="Tỉnh / Thành phố"
        value={provinceCode}
        onChange={(e) => onProvinceChange(e.target.value === '' ? '' : Number(e.target.value))}
        error={errors.city?.message}
        disabled={loadingProvinces}
      >
        <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </Select>

      <Select
        label="Quận / Huyện"
        value={districtCode}
        onChange={(e) => onDistrictChange(e.target.value === '' ? '' : Number(e.target.value))}
        error={errors.district?.message}
        disabled={!provinceCode || loadingDistricts}
      >
        <option value="">
          {!provinceCode ? 'Chọn tỉnh trước' : loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'}
        </option>
        {districts.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name}
          </option>
        ))}
      </Select>

      <Select
        label="Phường / Xã"
        value={wardCode}
        onChange={(e) => onWardChange(e.target.value === '' ? '' : Number(e.target.value))}
        disabled={!districtCode || loadingWards}
        hint={!districtCode ? 'Chọn quận/huyện trước' : undefined}
      >
        <option value="">
          {!districtCode ? 'Chọn quận trước' : loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
        </option>
        {wards.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
