/**
 * Advanced Charting with Candlestick Support
 * Integrates multiple charting libraries and candlestick patterns
 */

class CandlestickChartManager {
    constructor(containerElement) {
        this.container = containerElement;
        this.ohlcData = [];
        this.volumeData = [];
        this.chart = null;
        this.indicators = { sma: [], ema: [], bollinger: [], macd: [], rsi: [] };
    }

    createOHLCFromMultipliers(multipliers, period = 5) {
        const ohlcData = [];
        for (let i = 0; i < multipliers.length; i += period) {
            const chunk = multipliers.slice(i, i + period);
            if (chunk.length === 0) continue;
            const open = chunk[0];
            const close = chunk[chunk.length - 1];
            const high = Math.max(...chunk);
            const low = Math.min(...chunk);
            const volume = chunk.length;
            ohlcData.push({
                open: open.toFixed(2),
                high: high.toFixed(2),
                low: low.toFixed(2),
                close: close.toFixed(2),
                volume: volume,
                timestamp: new Date(Date.now() - (multipliers.length - i) * 1000).toISOString()
            });
        }
        this.ohlcData = ohlcData;
        return ohlcData;
    }

    detectPatterns() {
        const patterns = [];
        for (let i = 1; i < this.ohlcData.length; i++) {
            const prev = this.ohlcData[i - 1];
            const curr = this.ohlcData[i];
            if (this.isBullishEngulfing(prev, curr)) patterns.push({ type: 'Bullish Engulfing', index: i, signal: 'BUY' });
            if (this.isHammer(curr)) patterns.push({ type: 'Hammer', index: i, signal: 'BUY' });
            if (this.isMorningstar(this.ohlcData[i - 2], prev, curr)) patterns.push({ type: 'Morning Star', index: i, signal: 'BUY' });
            if (this.isBearishEngulfing(prev, curr)) patterns.push({ type: 'Bearish Engulfing', index: i, signal: 'SELL' });
            if (this.isShootingStar(curr)) patterns.push({ type: 'Shooting Star', index: i, signal: 'SELL' });
            if (this.isEveningstar(this.ohlcData[i - 2], prev, curr)) patterns.push({ type: 'Evening Star', index: i, signal: 'SELL' });
            if (this.isDoji(curr)) patterns.push({ type: 'Doji', index: i, signal: 'NEUTRAL' });
        }
        return patterns;
    }

    isBullishEngulfing(prev, curr) {
        const prevOpen = parseFloat(prev.open);
        const prevClose = parseFloat(prev.close);
        const currOpen = parseFloat(curr.open);
        const currClose = parseFloat(curr.close);
        return prevClose < prevOpen && currClose > currOpen && currOpen < prevClose && currClose > prevOpen;
    }

    isBearishEngulfing(prev, curr) {
        const prevOpen = parseFloat(prev.open);
        const prevClose = parseFloat(prev.close);
        const currOpen = parseFloat(curr.open);
        const currClose = parseFloat(curr.close);
        return prevClose > prevOpen && currClose < currOpen && currOpen > prevClose && currClose < prevOpen;
    }

    isHammer(candle) {
        const open = parseFloat(candle.open);
        const high = parseFloat(candle.high);
        const low = parseFloat(candle.low);
        const close = parseFloat(candle.close);
        const bodyHeight = Math.abs(close - open);
        const lowerWick = open > close ? open - low : close - low;
        const upperWick = high - Math.max(open, close);
        return lowerWick > bodyHeight * 2 && upperWick < bodyHeight * 0.5;
    }

    isShootingStar(candle) {
        const open = parseFloat(candle.open);
        const high = parseFloat(candle.high);
        const low = parseFloat(candle.low);
        const close = parseFloat(candle.close);
        const bodyHeight = Math.abs(close - open);
        const upperWick = high - Math.max(open, close);
        const lowerWick = Math.min(open, close) - low;
        return upperWick > bodyHeight * 2 && lowerWick < bodyHeight * 0.5;
    }

    isDoji(candle) {
        const open = parseFloat(candle.open);
        const close = parseFloat(candle.close);
        const bodyHeight = Math.abs(close - open);
        return bodyHeight < 0.1;
    }

    isMorningstar(first, second, third) {
        if (!first) return false;
        const f_close = parseFloat(first.close);
        const f_open = parseFloat(first.open);
        const s_close = parseFloat(second.close);
        const s_open = parseFloat(second.open);
        const t_close = parseFloat(third.close);
        const t_open = parseFloat(third.open);
        return f_close < f_open && Math.abs(s_close - s_open) < (f_open - f_close) * 0.5 && t_close > t_open && t_close > f_open;
    }

    isEveningstar(first, second, third) {
        if (!first) return false;
        const f_close = parseFloat(first.close);
        const f_open = parseFloat(first.open);
        const s_close = parseFloat(second.close);
        const s_open = parseFloat(second.open);
        const t_close = parseFloat(third.close);
        const t_open = parseFloat(third.open);
        return f_close > f_open && Math.abs(s_close - s_open) < (f_close - f_open) * 0.5 && t_close < t_open && t_close < f_open;
    }

    renderChart() {
        if (!this.container) {
            console.error('Container element not found');
            return;
        }
        const ctx = this.container.getContext('2d');
        const labels = this.ohlcData.map((_, i) => `${i + 1}`);
        const candleColors = this.ohlcData.map(candle => {
            const open = parseFloat(candle.open);
            const close = parseFloat(candle.close);
            return close > open ? '#4caf50' : '#f44336';
        });
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Close Price',
                        data: this.ohlcData.map(c => parseFloat(c.close)),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: candleColors
                    },
                    {
                        label: 'High',
                        data: this.ohlcData.map(c => parseFloat(c.high)),
                        borderColor: '#90a4ae',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Low',
                        data: this.ohlcData.map(c => parseFloat(c.low)),
                        borderColor: '#90a4ae',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Candlestick Chart' } },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { callback: function(value) { return 'x' + value.toFixed(2); } }
                    }
                }
            }
        });
    }

    exportData() {
        return { ohlc: this.ohlcData, patterns: this.detectPatterns(), indicators: this.indicators };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandlestickChartManager;
}