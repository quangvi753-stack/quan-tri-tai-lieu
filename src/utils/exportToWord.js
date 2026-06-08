export const exportHTMLToWord = (elementId, filename = 'document') => {
    var preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
    <meta charset='utf-8'>
    <title>Báo giá</title>
    <!--[if gte mso 9]>
    <xml>
    <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page Section1 {
            size: 595.3pt 841.9pt; /* A4 size */
            margin: 0.8in 0.8in 0.8in 0.8in; /* Clean standard margins */
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
        }
        div.Section1 {
            page: Section1;
        }
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt; 
            line-height: 1.4; 
            color: #000000;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            border: 0px none;
            margin-bottom: 12px;
        }
        th, td { 
            padding: 6px 8px; 
            border: 0px none;
            font-size: 11pt;
            vertical-align: middle;
        }
        
        /* Cấu hình viền cho các bảng kê chi tiết */
        .border-black, th.border-black, td.border-black,
        .border, th.border, td.border { 
            border: 1px solid #000000 !important; 
        }
        
        /* Màu nền */
        .bg-\\[\\#dcfce7\\], tr.bg-\\[\\#dcfce7\\], th.bg-\\[\\#dcfce7\\],
        tr[style*="background-color: rgb(220, 252, 231)"], tr[style*="background-color: #dcfce7"] { 
            background-color: #dcfce7 !important; 
        }
        .bg-\\[\\#f1f5f9\\], tr.bg-\\[\\#f1f5f9\\], th.bg-\\[\\#f1f5f9\\],
        tr[style*="background-color: rgb(241, 245, 249)"], tr[style*="background-color: #f1f5f9"] { 
            background-color: #f1f5f9 !important; 
        }
        .bg-slate-50, tr.bg-slate-50, td.bg-slate-50 { 
            background-color: #f8fafc !important; 
        }
        
        /* Custom Colors & Themes */
        .bg-navy, th.bg-navy, td.bg-navy,
        tr[style*="background-color: #1e3a8a"], th[style*="background-color: #1e3a8a"], td[style*="background-color: #1e3a8a"],
        tr[style*="background-color: rgb(30, 58, 138)"], th[style*="background-color: rgb(30, 58, 138)"], td[style*="background-color: rgb(30, 58, 138)"] {
            background-color: #1e3a8a !important;
            color: #ffffff !important;
        }
        .text-white {
            color: #ffffff !important;
        }
        .text-navy {
            color: #1e3a8a !important;
        }
        .bg-light-blue,
        tr[style*="background-color: #f0f4f8"], td[style*="background-color: #f0f4f8"],
        tr[style*="background-color: rgb(240, 244, 248)"], td[style*="background-color: rgb(240, 244, 248)"] {
            background-color: #f0f4f8 !important;
        }
        .bg-light-grey,
        tr[style*="background-color: #f8fafc"], td[style*="background-color: #f8fafc"],
        tr[style*="background-color: rgb(248, 250, 252)"], td[style*="background-color: rgb(248, 250, 252)"] {
            background-color: #f8fafc !important;
        }
        
        /* Custom Borders */
        .border-navy, th.border-navy, td.border-navy, table.border-navy {
            border: 1px solid #1e3a8a !important;
        }
        .border-grey, th.border-grey, td.border-grey, table.border-grey {
            border: 1px solid #cbd5e1 !important;
        }
        .border-bottom-navy {
            border-bottom: 2.5px solid #1e3a8a !important;
        }
        .border-bottom-grey {
            border-bottom: 1px solid #cbd5e1 !important;
        }
        
        /* Catalog Card specific styling for Word */
        .catalog-card {
            border: 1px solid #cbd5e1 !important;
            padding: 10px !important;
            background-color: #ffffff !important;
            vertical-align: top !important;
            width: 50% !important;
        }
        .catalog-img-container {
            background-color: #f8fafc !important;
            padding: 8px !important;
            text-align: center !important;
            margin-bottom: 8px !important;
        }
        
        /* Định dạng text */
        .text-left { text-align: left !important; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .font-bold { font-weight: bold !important; }
        .italic { font-style: italic !important; }
        .uppercase { text-transform: uppercase !important; }
        .underline { text-decoration: underline !important; }
        
        /* Hình ảnh sản phẩm */
        img { 
            max-width: 100%; 
            height: auto; 
            display: block; 
            margin: 0 auto;
        }
    </style>
    </head>
    <body>`;

    var postHtml = "</body></html>";

    const el = document.getElementById(elementId);
    if (!el) {
        alert("Không tìm thấy nội dung cần xuất!");
        return;
    }

    var html = preHtml + '<div class="Section1">' + el.innerHTML + '</div>' + postHtml;

    var blob = new Blob([html], {
        type: 'application/vnd.ms-word;charset=utf-8'
    });

    // Tạo link tải file
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Loại bỏ các ký tự không hợp lệ trong tên file trên Windows (đặc biệt là dấu gạch chéo '/')
    const sanitizedFilename = (filename || 'document')
        .replace(/[\/\\:\*\?"<>\|]/g, '_')
        .trim();

    // Tên file xuất
    const finalFilename = sanitizedFilename + '.doc';

    // Khởi tạo download
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, finalFilename);
    } else {
        // Tạo dải liên kết (link href) tới file blob
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = finalFilename;
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
};
