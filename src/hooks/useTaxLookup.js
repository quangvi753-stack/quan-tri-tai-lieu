import { useState, useCallback } from 'react';

/**
 * Hook tra cứu thông tin công ty qua Mã số thuế (MST)
 * Sử dụng API VietQR Business Lookup (miễn phí, không cần key)
 */
const useTaxLookup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Tra cứu thông tin công ty theo MST
     * @param {string} taxCode - Mã số thuế cần tra cứu
     * @returns {Promise<{name: string, address: string}|null>}
     */
    const lookupTax = useCallback(async (taxCode) => {
        if (!taxCode || taxCode.trim().length < 10) {
            setError('Mã số thuế phải có ít nhất 10 ký tự');
            return null;
        }

        const cleanCode = taxCode.trim().replace(/\s+/g, '').replace(/-/g, '');

        setLoading(true);
        setError(null);

        try {
            // Thử VietQR API trước
            const response = await fetch(
                `https://api.vietqr.io/v2/business/${cleanCode}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const json = await response.json();

            // VietQR trả về code 00 khi thành công
            if (json.code === '00' && json.data) {
                const data = json.data;
                return {
                    name: data.name || data.shortName || '',
                    address: data.address || '',
                    shortName: data.shortName || '',
                    internationalName: data.internationalName || '',
                };
            } else {
                setError('Không tìm thấy thông tin công ty với MST này');
                return null;
            }
        } catch (err) {
            // Thử API dự phòng của VCCI / Tracuumst
            try {
                const fallbackRes = await fetch(
                    `https://api.tracuumst.com/mst/${cleanCode}`,
                    { headers: { 'Accept': 'application/json' } }
                );
                if (fallbackRes.ok) {
                    const fallbackJson = await fallbackRes.json();
                    if (fallbackJson && fallbackJson.ten_cty) {
                        return {
                            name: fallbackJson.ten_cty || '',
                            address: fallbackJson.dia_chi || '',
                            shortName: '',
                            internationalName: '',
                        };
                    }
                }
            } catch (_) {
                // Ignore fallback errors
            }

            setError('Không thể tra cứu. Vui lòng kiểm tra kết nối mạng hoặc nhập thủ công.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { loading, error, lookupTax, clearError };
};

export default useTaxLookup;
