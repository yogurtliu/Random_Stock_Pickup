import React from 'react';

const SelectedStocks = ({ stocks }) => {
  if (!stocks || stocks.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2>🎯 已选股票</h2>
      <div className="selected-stocks">
        {stocks.map((stock, index) => (
          <div key={index} className="stock-card">
            <h3>{stock.name} ({stock.code})</h3>
            <div className="stock-info">
              <div>
                <label>所属概念:</label>
                <span>
                  {stock.concepts.length > 0 ? (
                    stock.concepts.map((concept, idx) => (
                      <span key={idx} className="badge badge-concept">
                        {concept}
                      </span>
                    ))
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div>
                <label>细分行业:</label>
                <span>{stock.subIndustry || '-'}</span>
              </div>
              <div>
                <label>所属同花顺行业:</label>
                <span className="badge badge-industry">{stock.industry || '-'}</span>
              </div>
              <div>
                <label>总市值:</label>
                <span>{stock.marketCap || '-'}</span>
              </div>
              <div>
                <label>主力净量:</label>
                <span>{stock.netVolume || '-'}</span>
              </div>
              <div>
                <label>市盈(动):</label>
                <span>{stock.pe || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedStocks;
