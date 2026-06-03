/**
 * Multi-Game Correlation Analyzer
 * Analyzes patterns and correlations across multiple games
 */

class MultiGameCorrelationAnalyzer {
    constructor() {
        this.games = {};
        this.correlationMatrix = [];
        this.timeWindow = 100;
    }

    addGameData(gameId, multiplier) {
        if (!this.games[gameId]) {
            this.games[gameId] = [];
        }
        this.games[gameId].push({
            value: multiplier,
            timestamp: Date.now()
        });
    }

    pearsonCorrelation(arr1, arr2) {
        if (arr1.length === 0 || arr2.length === 0) return 0;
        const n = Math.min(arr1.length, arr2.length);
        const mean1 = arr1.slice(-n).reduce((a, b) => a + b, 0) / n;
        const mean2 = arr2.slice(-n).reduce((a, b) => a + b, 0) / n;
        let numerator = 0, denominator1 = 0, denominator2 = 0;
        for (let i = 0; i < n; i++) {
            const diff1 = arr1[arr1.length - n + i] - mean1;
            const diff2 = arr2[arr2.length - n + i] - mean2;
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
        }
        const denominator = Math.sqrt(denominator1 * denominator2);
        return denominator === 0 ? 0 : numerator / denominator;
    }

    spearmanCorrelation(arr1, arr2) {
        const n = Math.min(arr1.length, arr2.length);
        const data1 = arr1.slice(-n);
        const data2 = arr2.slice(-n);
        const rank1 = this.getRanks(data1);
        const rank2 = this.getRanks(data2);
        return this.pearsonCorrelation(rank1, rank2);
    }

    getRanks(arr) {
        return arr
            .map((val, idx) => ({ val, idx }))
            .sort((a, b) => a.val - b.val)
            .map((item, rank) => ({ ...item, rank }))
            .sort((a, b) => a.idx - b.idx)
            .map(item => item.rank + 1);
    }

    calculateCorrelationMatrix() {
        const gameIds = Object.keys(this.games);
        const n = gameIds.length;
        this.correlationMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    this.correlationMatrix[i][j] = 1;
                } else {
                    const values1 = this.games[gameIds[i]].map(d => d.value);
                    const values2 = this.games[gameIds[j]].map(d => d.value);
                    this.correlationMatrix[i][j] = this.pearsonCorrelation(values1, values2);
                }
            }
        }
        return { gameIds, correlationMatrix: this.correlationMatrix };
    }

    detectCorrelationAnomalies(threshold = 0.7) {
        const result = this.calculateCorrelationMatrix();
        const anomalies = [];
        for (let i = 0; i < result.correlationMatrix.length; i++) {
            for (let j = i + 1; j < result.correlationMatrix[i].length; j++) {
                const correlation = result.correlationMatrix[i][j];
                if (Math.abs(correlation) > threshold) {
                    anomalies.push({
                        game1: result.gameIds[i],
                        game2: result.gameIds[j],
                        correlation: correlation.toFixed(3),
                        type: correlation > 0 ? 'positive' : 'negative'
                    });
                }
            }
        }
        return anomalies;
    }

    rollingWindowCorrelation(game1, game2, windowSize = 20) {
        if (!this.games[game1] || !this.games[game2]) return [];
        const data1 = this.games[game1].map(d => d.value);
        const data2 = this.games[game2].map(d => d.value);
        const maxLen = Math.min(data1.length, data2.length);
        const correlations = [];
        for (let i = windowSize; i <= maxLen; i++) {
            const window1 = data1.slice(i - windowSize, i);
            const window2 = data2.slice(i - windowSize, i);
            const corr = this.pearsonCorrelation(window1, window2);
            correlations.push({
                timestamp: Math.max(this.games[game1][i - 1].timestamp, this.games[game2][i - 1].timestamp),
                correlation: corr
            });
        }
        return correlations;
    }

    predictBasedOnCorrelation(targetGame, correlatedGames = {}) {
        if (!this.games[targetGame]) return null;
        const targetData = this.games[targetGame].map(d => d.value);
        const targetMean = targetData.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, targetData.length);
        let prediction = targetMean;
        let totalWeight = 0;
        for (const [gameId, weight] of Object.entries(correlatedGames)) {
            if (!this.games[gameId]) continue;
            const gameData = this.games[gameId].map(d => d.value);
            const correlation = this.pearsonCorrelation(targetData, gameData);
            const gameValue = gameData[gameData.length - 1];
            prediction += (gameValue * correlation * weight);
            totalWeight += Math.abs(correlation * weight);
        }
        return totalWeight > 0 ? prediction / (1 + totalWeight) : prediction;
    }

    getCorrelationStats() {
        const result = this.calculateCorrelationMatrix();
        const gameIds = result.gameIds;
        const stats = {};
        for (const gameId of gameIds) {
            const gameData = this.games[gameId].map(d => d.value);
            const mean = gameData.reduce((a, b) => a + b, 0) / gameData.length;
            const variance = gameData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / gameData.length;
            stats[gameId] = {
                mean: mean.toFixed(2),
                variance: variance.toFixed(2),
                stdDev: Math.sqrt(variance).toFixed(2),
                dataPoints: gameData.length,
                min: Math.min(...gameData).toFixed(2),
                max: Math.max(...gameData).toFixed(2)
            };
        }
        return stats;
    }

    export() {
        return {
            games: this.games,
            correlationMatrix: this.correlationMatrix,
            stats: this.getCorrelationStats()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiGameCorrelationAnalyzer;
}