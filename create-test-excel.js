const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Tạo thư mục test
const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Dữ liệu test
const data = [
  { 'Mã SKU': 'TEST001', 'Tên sản phẩm': 'Test Product 1', 'wed': 50000 },
  { 'Mã SKU': 'TEST002', 'Tên sản phẩm': 'Test Product 2', 'wed': 100000 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Prices');

const filePath = path.join(testDir, 'test-prices.xlsx');
XLSX.writeFile(wb, filePath);

console.log('✅ File Excel test created:', filePath);
console.log('📁 File size:', fs.statSync(filePath).size, 'bytes');
