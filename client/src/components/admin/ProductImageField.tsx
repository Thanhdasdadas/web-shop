import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseImageUrls, joinImageUrls } from '@/lib/slug';
import { uploadProductImage } from '@/lib/uploadProductImage';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductImageField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const urls = parseImageUrls(value);

  const setUrls = (next: string[]) => onChange(joinImageUrls(next));

  const removeAt = (index: number) => setUrls(urls.filter((_, i) => i !== index));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError('Chỉ chọn file ảnh (JPG, PNG, WebP, GIF).');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('Mỗi ảnh tối đa 10MB.');
          continue;
        }
        const url = await uploadProductImage(file);
        added.push(url);
      }
      if (added.length) setUrls([...urls, ...added]);
    } catch {
      setError('Tải ảnh thất bại. Kiểm tra đã đăng nhập admin và API đang chạy.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-sm font-medium text-brand-900/80">Hình ảnh sản phẩm</label>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
        </Button>
        <span className="self-center text-xs text-slate-500">hoặc dán link ảnh bên dưới</span>
      </div>

      {urls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={`${url}-${i}`} className="relative">
              <img
                src={url}
                alt=""
                className="h-24 w-24 rounded-lg border border-brand-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/96';
                }}
              />
              <button
                type="button"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                onClick={() => removeAt(i)}
                title="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Input
        label="Link ảnh (nhiều ảnh: cách nhau bằng dấu phẩy)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3"
        placeholder="/uploads/products/... hoặc https://..."
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
