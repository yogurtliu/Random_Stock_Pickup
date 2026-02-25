import * as XLSX from 'xlsx';

const REQUIRED_COLUMNS = [
  '代码',
  '名称',
  '所属概念',
  '细分行业',
  '所属同花顺行业',
  '总市值',
  '主力净量',
  '市盈(动)'
];

export const validateExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          reject(new Error('Excel文件中没有工作表'));
          return;
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          reject(new Error('Excel文件中没有足够的数据'));
          return;
        }
        
        const headers = jsonData[0].map(h => h ? h.toString().trim() : '');
        
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          reject(new Error(`Excel文件缺少以下必填列: ${missingColumns.join(', ')}`));
          return;
        }
        
        const stocks = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue;
          
          const stock = {};
          REQUIRED_COLUMNS.forEach((col, index) => {
            const headerIndex = headers.indexOf(col);
            if (headerIndex !== -1) {
              stock[col] = row[headerIndex];
            }
          });
          
          if (stock['代码'] && stock['名称']) {
            stocks.push(stock);
          }
        }
        
        if (stocks.length === 0) {
          reject(new Error('Excel文件中没有有效的股票数据'));
          return;
        }
        
        resolve(stocks);
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseStockData = (stocks) => {
  return stocks.map(stock => {
    let marketCap = stock['总市值'] || '';
    if (marketCap && !isNaN(marketCap)) {
      marketCap = parseFloat(marketCap);
      if (marketCap >= 10000) {
        marketCap = (marketCap / 10000).toFixed(2) + ' 亿';
      } else {
        marketCap = marketCap.toFixed(2) + ' 亿';
      }
    }
    
    return {
      code: stock['代码'] || '',
      name: stock['名称'] || '',
      concepts: stock['所属概念'] ? stock['所属概念'].split(/[,，;；]/).map(c => c.trim()).filter(c => c) : [],
      subIndustry: stock['细分行业'] || '',
      industry: stock['所属同花顺行业'] || '',
      marketCap: marketCap,
      netVolume: stock['主力净量'] || '',
      pe: stock['市盈(动)'] || ''
    };
  });
};
