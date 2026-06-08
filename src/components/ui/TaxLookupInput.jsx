import React, { useState } from 'react';
import { Input } from './input';
import { Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useTaxLookup from '../../hooks/useTaxLookup';

/**
 * TaxLookupInput - Input MST có tích hợp tra cứu thông tin công ty tự động
 *
 * Props:
 *   value          - Giá trị MST hiện tại
 *   onChange       - Hàm cập nhật giá trị MST (nhận string)
 *   onFound        - Callback khi tra cứu thành công: (result) => void
 *                    result: { name, address, shortName, internationalName }
 *   placeholder    - Placeholder text
 *   className      - CSS classes thêm vào
 *   disabled       - Disable input
 */
const TaxLookupInput = ({
    value = '',
    onChange,
    onFound,
    placeholder = 'Nhập MST rồi nhấn 🔍 để tra cứu...',
    className = '',
    disabled = false,
}) => {
    const { loading, error, lookupTax, clearError } = useTaxLookup();
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const newVal = e.target.value;
        onChange(newVal);
        // Reset success/error khi user thay đổi MST
        setSuccess(false);
        clearError();
    };

    const handleLookup = async () => {
        if (!value || value.trim().length < 8) return;
        setSuccess(false);
        const result = await lookupTax(value);
        if (result) {
            setSuccess(true);
            if (onFound) onFound(result);
            // Reset success badge sau 4 giây
            setTimeout(() => setSuccess(false), 4000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLookup();
        }
    };

    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`font-mono pr-8 ${success ? 'border-emerald-500 ring-1 ring-emerald-500' : error ? 'border-red-400 ring-1 ring-red-300' : ''} ${className}`}
                        disabled={disabled || loading}
                    />
                    {/* Status icon bên trong input */}
                    {success && (
                        <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                    )}
                    {error && !loading && (
                        <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
                    )}
                </div>

                {/* Nút tra cứu */}
                <button
                    type="button"
                    onClick={handleLookup}
                    disabled={loading || !value || value.trim().length < 8 || disabled}
                    title="Tra cứu thông tin công ty theo MST (Enter hoặc nhấn nút)"
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap
                        border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-400
                        ${loading
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait'
                            : success
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-500 active:scale-95'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tìm...</span>
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã tra cứu!</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-3.5 h-3.5" />
                            <span>Tra cứu MST</span>
                        </>
                    )}
                </button>
            </div>

            {/* Thông báo lỗi */}
            {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-100">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Gợi ý: nhấn Enter */}
            {!error && !success && value && value.trim().length >= 8 && !loading && (
                <div className="text-[10px] text-slate-400 pl-1">
                    Nhấn <kbd className="bg-slate-100 border border-slate-300 rounded px-1 text-[10px]">Enter</kbd> hoặc nút "Tra cứu MST" để tự động điền thông tin
                </div>
            )}
        </div>
    );
};

export default TaxLookupInput;
