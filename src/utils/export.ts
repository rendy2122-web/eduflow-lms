export const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
  const escapeCell = (cell: any) => {
    const str = cell === null || cell === undefined ? '' : String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };
  
  const csvContent = '\uFEFF' + [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (filename: string, worksheetName: string, headers: string[], rows: any[][]) => {
  const escapeCell = (cell: any) => {
    return cell === null || cell === undefined ? '' : String(cell);
  };

  let tableHtml = `<table border="1"><thead><tr>`;
  headers.forEach(h => {
    tableHtml += `<th style="background-color: #4f46e5; color: #ffffff; font-weight: bold; padding: 5px;">${h}</th>`;
  });
  tableHtml += `</tr></thead><tbody>`;
  rows.forEach(row => {
    tableHtml += `<tr>`;
    row.forEach(cell => {
      tableHtml += `<td style="padding: 5px;">${escapeCell(cell)}</td>`;
    });
    tableHtml += `</tr>`;
  });
  tableHtml += `</tbody></table>`;

  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if mso]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheetName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta charset="utf-8">
    </head>
    <body>${tableHtml}</body>
    </html>
  `;

  const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
