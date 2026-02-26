import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import StockList from './components/StockList';
import SelectedStocks from './components/SelectedStocks';
import AnalysisResult from './components/AnalysisResult';
import { validateExcelFile, parseStockData } from './utils/excelParser';
import { analyzeStocks, generateMockAnalysis } from './services/api';

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [useMockApi, setUseMockApi] = useState(true);
  const [activeTab, setActiveTab] = useState('import');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 从localStorage读取历史记录
    const savedHistory = localStorage.getItem('stockSelectionHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
        localStorage.removeItem('stockSelectionHistory');
      }
    }
    
    // 从localStorage读取股票列表
    const savedStocks = localStorage.getItem('stockList');
    if (savedStocks) {
      try {
        const parsedStocks = JSON.parse(savedStocks);
        setStocks(parsedStocks);
        if (parsedStocks.length > 0) {
          setActiveTab('stocks');
        }
      } catch (error) {
        console.error('Failed to parse stocks:', error);
        localStorage.removeItem('stockList');
      }
    }
  }, []);

  const handleFileLoaded = async (file) => {
    setLoading(true);
    setError('');
    setAnalysis(null);
    setSelectedStocks([]);

    try {
      const rawData = await validateExcelFile(file);
      const parsedData = parseStockData(rawData);
      setStocks(parsedData);
      // 保存股票列表到localStorage
      localStorage.setItem('stockList', JSON.stringify(parsedData));
      setActiveTab('stocks');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSelect = () => {
    setError('');
    setAnalysis(null);

    if (stocks.length < 2) {
      setError('股票数据不足，无法选择2支股票');
      return;
    }

    const shuffled = [...stocks].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    setSelectedStocks(selected);
    
    const selectionTime = new Date();
    const selectionRecord = {
      id: Date.now().toString(),
      timestamp: selectionTime.toISOString(),
      formattedTime: selectionTime.toLocaleString('zh-CN'),
      stocks: selected
    };
    
    let updatedHistory = [selectionRecord, ...history];
    // 限制历史记录数量为50条
    if (updatedHistory.length > 50) {
      updatedHistory = updatedHistory.slice(0, 50);
    }
    setHistory(updatedHistory);
    localStorage.setItem('stockSelectionHistory', JSON.stringify(updatedHistory));
    
    setActiveTab('selected');
  };

  const handleAnalyze = async () => {
    if (selectedStocks.length !== 2) {
      setError('请先选择2支股票');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      let result;
      if (useMockApi) {
        result = generateMockAnalysis(selectedStocks);
      } else {
        result = await analyzeStocks(selectedStocks);
      }
      setAnalysis(result);
      setActiveTab('analysis');
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStocks([]);
    setSelectedStocks([]);
    setAnalysis(null);
    setError('');
    // 清除localStorage中的股票列表
    localStorage.removeItem('stockList');
    setActiveTab('import');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎲 随机选股碰运气</h1>
        <p>还不如自己选，随机选2支股票，看谁更有运气</p>
      </div>

      {stocks.length > 0 && (
        <div className="tabs">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              📁 数据导入
            </button>
            <button
              className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('stocks')}
            >
              📋 股票列表
            </button>
            <button
              className={`tab-button ${activeTab === 'selected' ? 'active' : ''}`}
              onClick={() => setActiveTab('selected')}
              disabled={selectedStocks.length === 0}
            >
              🎯 已选股票
            </button>
            <button
              className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
              disabled={!analysis}
            >
              📊 分析结果
            </button>
            <button
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📜 历史记录
            </button>
          </div>
        </div>
      )}

      <div className="tab-content">
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {activeTab === 'import' && (
          <>
            <h2>📁 数据导入</h2>
            <FileUpload onFileLoaded={handleFileLoaded} loading={loading} />
            
            {stocks.length === 0 && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
                <h3>开始使用</h3>
                <p style={{ color: '#666', marginTop: '10px' }}>
                  请上传包含股票数据的Excel文件开始分析
                </p>
                <p style={{ color: '#999', marginTop: '10px', fontSize: '0.9rem' }}>
                  支持 .xlsx 和 .xls 格式
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'stocks' && stocks.length > 0 && (
          <>
            <h2>📋 股票列表</h2>
            
            <div className="card">
              <h3>🎮 操作面板</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                <button
                  className="button"
                  onClick={handleRandomSelect}
                  disabled={loading || stocks.length < 2}
                >
                  🎲 随机选择2支股票
                </button>
                
                <button
                  className="button"
                  onClick={handleReset}
                  disabled={loading || analyzing}
                >
                  🔄 重置
                </button>
              </div>
            </div>

            <StockList stocks={stocks} selectedStocks={selectedStocks} />
          </>
        )}

        {activeTab === 'selected' && selectedStocks.length > 0 && (
          <>
            <h2>🎯 已选股票</h2>
            
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>🔍 分析操作</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                <button
                  className="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  🤖 {analyzing ? '分析中...' : 'AI分析'}
                </button>
              </div>
              
              <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useMockApi}
                    onChange={(e) => setUseMockApi(e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  <span>使用模拟数据（无需配置API）</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                  取消勾选后将调用真实的AI分析接口，需要在 .env 文件中配置 VITE_API_BASE_URL
                </p>
              </div>
            </div>

            <SelectedStocks stocks={selectedStocks} />
          </>
        )}

        {activeTab === 'analysis' && analysis && (
          <>
            <h2>📊 分析结果</h2>
            <AnalysisResult analysis={analysis} />
            
            <div className="card" style={{ marginTop: '20px' }}>
              <h3>🔄 后续操作</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                <button
                  className="button"
                  onClick={() => setActiveTab('stocks')}
                >
                  🔄 重新选择股票
                </button>
                <button
                  className="button"
                  onClick={handleReset}
                >
                  📁 上传新文件
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <h2>📜 历史选股记录</h2>
            
            <div className="card">
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
                  <h3>暂无历史记录</h3>
                  <p style={{ color: '#666', marginTop: '10px' }}>
                    当您选择股票后，记录将自动保存到这里
                  </p>
                  <button
                    className="button"
                    onClick={() => setActiveTab('stocks')}
                    style={{ marginTop: '20px' }}
                  >
                    📋 去选择股票
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>共 {history.length} 条记录</h3>
                    <button
                      className="button"
                      onClick={() => {
                        if (window.confirm('确定要清空所有历史记录吗？')) {
                          setHistory([]);
                          localStorage.removeItem('stockSelectionHistory');
                        }
                      }}
                    >
                      🗑️ 清空记录
                    </button>
                  </div>
                  <div className="history-list">
                    {history.map((record) => (
                      <div key={record.id} className="history-item">
                        <div className="history-header">
                          <h4>选股时间: {record.formattedTime}</h4>
                        </div>
                        <div className="history-stocks">
                          {record.stocks.map((stock, index) => (
                            <div key={index} className="history-stock-item">
                              <strong>{stock.name}</strong>
                              <span style={{ color: '#666', marginLeft: '10px' }}>({stock.code})</span>
                              <span className="badge badge-industry" style={{ marginLeft: '10px' }}>
                                {stock.industry || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {analyzing && (
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="loading">
              <div className="spinner"></div>
              <span style={{ marginLeft: '20px', fontSize: '1.1rem' }}>
                AI正在分析中，请稍候...
              </span>
            </div>
          </div>
        )}

        {stocks.length === 0 && activeTab !== 'import' && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
            <h3>开始使用</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              请先上传包含股票数据的Excel文件
            </p>
            <button
              className="button"
              onClick={() => setActiveTab('import')}
              style={{ marginTop: '20px' }}
            >
              📁 前往上传
            </button>
          </div>
        )}

        {activeTab === 'selected' && selectedStocks.length === 0 && stocks.length > 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
            <h3>还未选择股票</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              请先从股票列表中随机选择2支股票
            </p>
            <button
              className="button"
              onClick={() => setActiveTab('stocks')}
              style={{ marginTop: '20px' }}
            >
              📋 前往选择
            </button>
          </div>
        )}

        {activeTab === 'analysis' && !analysis && selectedStocks.length > 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <h3>还未分析股票</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              请点击分析按钮获取AI分析报告
            </p>
            <button
              className="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{ marginTop: '20px' }}
            >
              🤖 {analyzing ? '分析中...' : '开始AI分析'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
