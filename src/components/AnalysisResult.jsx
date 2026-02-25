import React from 'react';

const AnalysisResult = ({ analysis }) => {
  if (!analysis) {
    return null;
  }

  const { stocks, comparison } = analysis;

  return (
    <div className="card">
      <h2>📊 AI分析报告</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        分析时间: {new Date(analysis.timestamp).toLocaleString('zh-CN')}
      </p>
      
      {stocks.map((stock, index) => (
        <div key={index} style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.3rem' }}>
            {stock.name} ({stock.code})
          </h3>
          
          {stock.analysis && (
            <div className="analysis-result">
              <div className="analysis-section">
                <h4>📌 基本信息</h4>
                <p>{stock.analysis.basicInfo?.summary}</p>
                <p>{stock.analysis.basicInfo?.industryPosition}</p>
                <p>{stock.analysis.basicInfo?.concepts}</p>
              </div>
              
              <div className="analysis-section">
                <h4>💰 财务指标分析</h4>
                <p>{stock.analysis.financialIndicators?.peAnalysis}</p>
                <p>{stock.analysis.financialIndicators?.marketCapAnalysis}</p>
                <p>{stock.analysis.financialIndicators?.netVolumeAnalysis}</p>
              </div>
              
              <div className="analysis-section">
                <h4>📈 市场表现评估</h4>
                <p><strong>走势:</strong> {stock.analysis.marketPerformance?.trend}</p>
                <p><strong>技术面:</strong> {stock.analysis.marketPerformance?.technical}</p>
                <p><strong>市场情绪:</strong> {stock.analysis.marketPerformance?.sentiment}</p>
              </div>
              
              <div className="analysis-section">
                <h4>💡 投资建议</h4>
                <p><strong>风险等级:</strong> <span className="badge badge-industry">{stock.analysis.investmentAdvice?.riskLevel}</span></p>
                <p><strong>建议:</strong> {stock.analysis.investmentAdvice?.suggestion}</p>
                <p><strong>关注要点:</strong></p>
                <ul>
                  {stock.analysis.investmentAdvice?.watchPoints?.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {comparison && (
        <div className="analysis-section" style={{ background: '#e8f0fe' }}>
          <h4>🔄 对比分析</h4>
          <p>{comparison.summary}</p>
          <p><strong>综合建议:</strong> {comparison.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
