/**
 * Advanced Time-Series Forecasting Module
 * LSTM-inspired predictions with exponential smoothing
 */

class TimeSeriesForecasting {
    constructor() {
        this.data = [];
        this.forecasts = [];
        this.alpha = 0.3;
        this.beta = 0.1;
        this.gamma = 0.1;
        this.seasonalPeriod = 5;
    }

    addDataPoint(value) {
        this.data.push({
            value,
            timestamp: Date.now(),
            index: this.data.length
        });
    }

    simpleMovingAverage(period = 5) {
        const sma = [];
        for (let i = period - 1; i < this.data.length; i++) {
            const sum = this.data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.value, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    exponentialMovingAverage(period = 5) {
        if (this.data.length === 0) return [];
        const ema = [this.data[0].value];
        const multiplier = 2 / (period + 1);
        for (let i = 1; i < this.data.length; i++) {
            const value = (this.data[i].value * multiplier) + (ema[i - 1] * (1 - multiplier));
            ema.push(value);
        }
        return ema;
    }

    calculateMACD() {
        const ema12 = this.exponentialMovingAverage(12);
        const ema26 = this.exponentialMovingAverage(26);
        const macd = [];
        const startIdx = Math.max(ema12.length, ema26.length) - Math.min(ema12.length, ema26.length);
        for (let i = startIdx; i < Math.min(ema12.length, ema26.length); i++) {
            macd.push(ema12[i] - ema26[i]);
        }
        return {
            macd,
            signal: this.exponentialMovingAverage(9),
            histogram: macd.map((m, i) => m - (this.exponentialMovingAverage(9)[i] || m))
        };
    }

    tripleExponentialSmoothing(forecast_period = 5) {
        if (this.data.length < this.seasonalPeriod) return this.simpleMovingAverage(3);
        const n = this.data.length;
        const values = this.data.map(d => d.value);
        let level = values[0];
        let trend = (values[1] - values[0]);
        const seasonal = [];
        for (let i = 0; i < this.seasonalPeriod; i++) {
            seasonal[i] = values[i] / level;
        }
        for (let i = 1; i < n; i++) {
            const prevLevel = level;
            const prevTrend = trend;
            const seasonalIdx = i % this.seasonalPeriod;
            level = this.alpha * (values[i] / seasonal[seasonalIdx]) + (1 - this.alpha) * (prevLevel + prevTrend);
            trend = this.beta * (level - prevLevel) + (1 - this.beta) * prevTrend;
            seasonal[seasonalIdx] = this.gamma * (values[i] / level) + (1 - this.gamma) * seasonal[seasonalIdx];
        }
        const forecast = [];
        for (let i = 1; i <= forecast_period; i++) {
            const pred = (level + i * trend) * seasonal[i % this.seasonalPeriod];
            forecast.push(Math.max(1.01, pred));
        }
        return forecast;
    }

    autoregressive(lags = 3, forecast_period = 5) {
        if (this.data.length < lags) return this.simpleMovingAverage(2);
        const values = this.data.map(d => d.value);
        const forecast = [];
        const mean = values.reduce((a, b) => a + b) / values.length;
        const autocovariances = [];
        for (let k = 0; k <= lags; k++) {
            let sum = 0;
            for (let i = k; i < values.length; i++) {
                sum += (values[i] - mean) * (values[i - k] - mean);
            }
            autocovariances[k] = sum / values.length;
        }
        let lastValues = values.slice(-lags);
        for (let f = 0; f < forecast_period; f++) {
            let prediction = mean;
            for (let i = 0; i < lags; i++) {
                const phi = autocovariances[i + 1] / autocovariances[0];
                prediction += phi * (lastValues[i] - mean);
            }
            forecast.push(Math.max(1.01, prediction));
            lastValues.shift();
            lastValues.push(prediction);
        }
        return forecast;
    }

    bollingerBands(period = 20, stdDevs = 2) {
        const sma = this.simpleMovingAverage(period);
        const bands = [];
        for (let i = period - 1; i < this.data.length; i++) {
            const slice = this.data.slice(i - period + 1, i + 1);
            const mean = sma[i - period + 1];
            const variance = slice.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / period;
            const stdDev = Math.sqrt(variance);
            bands.push({
                upper: mean + (stdDevs * stdDev),
                middle: mean,
                lower: mean - (stdDevs * stdDev),
                value: this.data[i].value
            });
        }
        return bands;
    }

    relativeStrengthIndex(period = 14) {
        if (this.data.length < period + 1) return [];
        const values = this.data.map(d => d.value);
        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(values[i] - values[i - 1]);
        }
        let avgGain = 0, avgLoss = 0;
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) avgGain += changes[i];
            else avgLoss += Math.abs(changes[i]);
        }
        avgGain /= period;
        avgLoss /= period;
        const rsi = [];
        for (let i = period; i < changes.length; i++) {
            if (changes[i] > 0) avgGain = (avgGain * (period - 1) + changes[i]) / period;
            else avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
            const rs = avgGain / (avgLoss || 1);
            rsi.push(100 - (100 / (1 + rs)));
        }
        return rsi;
    }

    getComprehensiveForecast(forecastPeriod = 5) {
        return {
            tripleExponential: this.tripleExponentialSmoothing(forecastPeriod),
            autoregressive: this.autoregressive(3, forecastPeriod),
            sma: this.simpleMovingAverage(5),
            ema: this.exponentialMovingAverage(5),
            macd: this.calculateMACD(),
            bollingerBands: this.bollingerBands(20, 2),
            rsi: this.relativeStrengthIndex(14)
        };
    }

    ensembleForecast(forecastPeriod = 5) {
        const forecasts = {
            tes: this.tripleExponentialSmoothing(forecastPeriod),
            ar: this.autoregressive(3, forecastPeriod)
        };
        const ensemble = [];
        for (let i = 0; i < forecastPeriod; i++) {
            const avg = (forecasts.tes[i] + forecasts.ar[i]) / 2;
            ensemble.push({
                predicted: avg,
                lower: Math.min(forecasts.tes[i], forecasts.ar[i]),
                upper: Math.max(forecasts.tes[i], forecasts.ar[i]),
                confidence: Math.abs(forecasts.tes[i] - forecasts.ar[i]) < 0.5 ? 0.8 : 0.6
            });
        }
        return ensemble;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSeriesForecasting;
}