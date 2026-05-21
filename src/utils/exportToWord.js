export const exportHTMLToWord = (elementId, filename = 'document') => {
    var preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; }
        table { border-collapse: collapse; }
        th, td { padding: 5px; }
        img { max-width: 100%; height: auto; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        .text-center { text-align: center; }
        .underline { text-decoration: underline; }
    </style>
    </head><body>`;

    var postHtml = "</body></html>";

    const el = document.getElementById(elementId);
    if (!el) {
        alert("Không tìm thấy nội dung cần xuất!");
        return;
    }

    var html = preHtml + el.innerHTML + postHtml;

    var blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    // Tạo link tải file
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Tên file xuất
    filename = filename ? filename + '.doc' : 'document.doc';

    // Khởi tạo download
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Tạo dải liên kết (link href) tới file blob
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
};
