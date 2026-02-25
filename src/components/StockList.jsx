import React from 'react';

const StockList = ({ stocks, selectedStocks }) => {
  if (stocks.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2>📋 已导入股票列表</h2>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        共导入 {stocks.length} 支股票
      </p>
      
      <div className="stock-list">
        {stocks.map((stock, index) => (
          <div key={index} className="stock-item">
            <div>
              <strong>{stock.name}</strong>
              <span style={{ color: '#666', marginLeft: '10px' }}>
                ({stock.code})
              </span>
            </div>
            <div>
              {stock.concepts.slice(0, 2).map((concept, idx) => (
                <span key={idx} className="badge badge-concept">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;
