
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const headers = ['Date', 'CustomerName', 'ItemName', 'Quantity', 'Price'];
const sampleData = [
    ['2025-01-01', 'Kim Fabric', 'Cotton 20s Blue', 100, 4500],
    ['2025-01-02', 'Lee Fashion', 'Linen White', 50, 6000]
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

// Set column widths
ws['!cols'] = [
    { wch: 15 }, // Date
    { wch: 20 }, // Customer
    { wch: 25 }, // Item
    { wch: 10 }, // Qty
    { wch: 15 }, // Price
];

XLSX.utils.book_append_sheet(wb, ws, 'MigrationData');

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const filePath = path.join(publicDir, 'template_migration.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Template created at ${filePath}`);
