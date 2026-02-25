import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const API_KEY = import.meta.env.VITE_API_KEY;

export const analyzeStocks = async (stocks) => {
  try {
    if (!API_KEY) {
      throw new Error('API密钥未配置，请在.env文件中设置VITE_API_KEY');
    }

    const prompt = generateAnalysisPrompt(stocks);
    
    const response = await axios.post(API_BASE_URL, {
      model: "Qwen/Qwen3-VL-235B-A22B-Thinking",
      messages: [
        {
          role: "system",
          content: "你是一位专业的股票分析师，精通财务分析、市场趋势评估和投资策略制定。请基于提供的股票数据，生成详细、专业的分析报告。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { "type": "json_object" }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 60000
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
      try {
        const analysisData = JSON.parse(response.data.choices[0].message.content);
        return {
          timestamp: new Date().toISOString(),
          ...analysisData
        };
      } catch (jsonError) {
        throw new Error('AI返回的数据格式错误，无法解析为JSON');
      }
    } else {
      throw new Error('AI分析服务返回格式不正确');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`API错误: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('无法连接到AI分析服务，请检查网络连接');
    } else {
      throw new Error(`请求失败: ${error.message}`);
    }
  }
};

const generateAnalysisPrompt = (stocks) => {
  const stockData = stocks.map((stock, index) => {
    return {
      序号: index + 1,
      代码: stock.code,
      名称: stock.name,
      所属概念: stock.concepts.join('、'),
      细分行业: stock.subIndustry,
      所属同花顺行业: stock.industry,
      总市值: stock.marketCap,
      主力净量: stock.netVolume,
      市盈_动: stock.pe
    };
  });

  return `请基于以下2支股票的详细数据，为每支股票生成专业的分析报告，并提供对比分析：\n\n${JSON.stringify(stockData, null, 2)}\n\n请按照以下JSON格式输出分析结果：\n{\n  "stocks": [\n    {\n      "code": "股票代码",\n      "name": "股票名称",\n      "analysis": {\n        "basicInfo": {\n          "summary": "基本信息摘要",\n          "industryPosition": "行业地位分析",\n          "concepts": "概念分析"
        },\n        "financialIndicators": {\n          "peAnalysis": "市盈率分析",\n          "marketCapAnalysis": "市值分析",\n          "netVolumeAnalysis": "主力净量分析"
        },\n        "marketPerformance": {\n          "trend": "走势分析",\n          "technical": "技术分析",\n          "sentiment": "市场情绪分析"
        },\n        "investmentAdvice": {\n          "riskLevel": "风险等级",\n          "suggestion": "投资建议",\n          "watchPoints": ["关注要点1", "关注要点2", "关注要点3", "关注要点4"]\n        }\n      }\n    }\n  ],\n  "comparison": {\n    "summary": "对比分析摘要",\n    "recommendation": "综合建议"
  }\n}`;
};

export const generateMockAnalysis = (stocks) => {
  return {
    timestamp: new Date().toISOString(),
    stocks: stocks.map(stock => ({
      ...stock,
      analysis: {
        basicInfo: {
          summary: `${stock.name}(${stock.code})属于${stock.industry}行业，当前总市值为${stock.marketCap}亿元，动态市盈率为${stock.pe}倍。`,
          industryPosition: `该股票在${stock.subIndustry}细分行业中具有一定的市场地位。`,
          concepts: stock.concepts.length > 0 ? `涉及概念: ${stock.concepts.join('、')}` : '暂无热门概念'
        },
        financialIndicators: {
          peAnalysis: stock.pe ? `动态市盈率${stock.pe}倍，${parseFloat(stock.pe) < 20 ? '估值相对较低' : parseFloat(stock.pe) > 50 ? '估值相对较高' : '估值处于合理区间'}。` : '市盈率数据缺失，无法进行估值分析。',
          marketCapAnalysis: stock.marketCap ? `总市值${stock.marketCap}亿元，${parseFloat(stock.marketCap) > 500 ? '属于大盘股' : parseFloat(stock.marketCap) > 100 ? '属于中盘股' : '属于小盘股'}。` : '市值数据缺失。',
          netVolumeAnalysis: stock.netVolume ? `主力净量${stock.netVolume}，${parseFloat(stock.netVolume) > 0 ? '资金呈现净流入状态，显示主力资金看好' : '资金呈现净流出状态，需关注资金动向'}。` : '主力净量数据缺失。'
        },
        marketPerformance: {
          trend: '近期股价走势相对平稳，成交量适中。',
          technical: '技术指标显示股价处于震荡整理阶段，建议关注关键支撑位和阻力位。',
          sentiment: '市场情绪整体中性，投资者观望情绪较浓。'
        },
        investmentAdvice: {
          riskLevel: '中等风险',
          suggestion: '建议谨慎关注，可考虑在回调至支撑位时适量建仓，注意控制仓位和风险。',
          watchPoints: [
            '关注行业政策变化',
            '关注公司基本面改善情况',
            '关注主力资金流向变化',
            '注意市场整体风险偏好变化'
          ]
        }
      }
    })),
    comparison: {
      summary: `对比分析显示，${stocks[0].name}和${stocks[1].name}在行业属性和市值规模上存在一定差异。`,
      recommendation: `综合评估后，建议投资者根据自身风险偏好和投资目标，选择适合的标的进行配置。`
    }
  };
};
