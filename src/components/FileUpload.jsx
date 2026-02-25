import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileLoaded, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    setError('');
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('请上传Excel文件（.xlsx或.xls格式）');
      return;
    }
    
    setFileName(file.name);
    onFileLoaded(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2>📁 导入股票数据</h2>
      <p style={{ color: '#666', marginBottom: '15px', marginTop: '10px' }}>
        请上传包含以下列的Excel文件：代码、名称、所属概念、细分行业、所属同花顺行业、总市值、主力净量、市盈(动)
      </p>
      
      <div
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          disabled={loading}
        />
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
        <p style={{ fontSize: '1.1rem', color: '#667eea' }}>
          {fileName ? fileName : '点击或拖拽Excel文件到此处'}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '5px' }}>
          支持 .xlsx 和 .xls 格式
        </p>
      </div>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
