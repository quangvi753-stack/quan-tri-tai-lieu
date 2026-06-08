const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';
const chuHangDonVi = ('1 một' + defaultNumbers).split(' ');
const chuHangChuc = ('lẻ mười' + defaultNumbers).split(' ');
const chuHangTram = ('không một' + defaultNumbers).split(' ');

function convertBlockThree(number) {
    if (number == '000') return '';
    var _a = number + '';

    switch (_a.length) {
        case 0: return '';
        case 1: return chuHangDonVi[_a];
        case 2: return convertBlockTwo(_a);
        case 3:
            var chucDv = '';
            if (_a.slice(1, 3) != '00') {
                chucDv = convertBlockTwo(_a.slice(1, 3));
            }
            var tram = chuHangTram[_a[0]] + ' trăm';
            return tram + ' ' + chucDv;
    }
}

function convertBlockTwo(number) {
    var _a = number + '';
    switch (_a.length) {
        case 1: return chuHangDonVi[_a];
        case 2:
            var str = '';
            // chuc
            if (_a[0] == '1') {
                str = 'mười';
            } else if (_a[0] == '0') {
                str = 'lẻ';
            } else {
                str = chuHangChuc[_a[0]] + ' mươi';
            }

            // don vi
            var dv = '';
            if (_a[1] == '1' && _a[0] != '0' && _a[0] != '1') {
                dv = 'mốt';
            } else if (_a[1] == '5' && _a[0] != '0') {
                dv = 'lăm';
            } else if (_a[1] == '4' && _a[0] != '0' && _a[0] != '1') {
                dv = 'tư';
            } else if (_a[1] != '0') {
                dv = chuHangDonVi[_a[1]];
            }

            return str + ' ' + dv;
    }
}

export function numberToWords(number) {
    if (number === 0) return 'không đồng';
    var str = parseInt(number) + '';
    var i = 0;
    var arr = [];
    while (i < str.length) {
        arr.push(str.substring(str.length - i - 3, str.length - i));
        i += 3;
    }

    var blockNames = ['', 'nghìn', 'triệu', 'tỉ', 'nghìn tỉ', 'triệu tỉ'];
    var rsString = '';
    for (i = 0; i < arr.length; i++) {
        var strBlock = convertBlockThree(arr[i]);
        if (strBlock.trim() != '') {
            var padding = '';
            if (i > 0 && strBlock.indexOf('không trăm') == -1 && arr[i].length == 3 && arr[i][0] == '0') {
                padding = 'không trăm ';
            }
            rsString = padding + strBlock + ' ' + blockNames[i] + ' ' + rsString;
        }
    }

    rsString = rsString.trim().replace(/ +/g, ' ');
    // Handle edge case starting with "không trăm" or "lẻ"
    if (rsString.startsWith('không trăm ')) {
        rsString = rsString.substring(11); // remove "không trăm "
    }
    if (rsString.startsWith('lẻ ')) {
        rsString = rsString.substring(3); // remove "lẻ "
    }

    // Capitalize first letter
    rsString = rsString.charAt(0).toUpperCase() + rsString.slice(1);

    return rsString + ' đồng ./.';
}
