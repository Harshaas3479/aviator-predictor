// Aviator Predictor - Main Logic
class AviatorPredictor {
    constructor() {
        this.history = [];
        this.chart = null;
        this.loadFromLocalStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('predictBtn').addEventListener('click', () => this.analyze());
    }

    analyze() {
        const roundId = document.getElementById('roundId').value.trim();
        const multiplier = parseFloat(document.getElementById('multiplier').value);
        const historicalDataStr = document.getElementById('historicalData').value.trim();

        if (!roundId || isNaN(multiplier) || !historicalDataStr) {
            alert('Please fill in all fields');
            return;
        }

        const historicalData = historicalDataStr
            .split(',')
            .map(x => parseFloat(x.trim()))
            .filter(x => !isNaN(x) && x > 0);

        if (historicalData.length < 3) {
            alert('Please provide at least 3 historical multiplier values');
            return;
        }

        // Add current round to history
        this.addToHistory(roundId, multiplier);

        // Perform analysis
        const analysis = this.performAnalysis(multiplier, historicalData);

        // Display results
        this.displayResults(roundId, multiplier, analysis, historicalData);

        // Update chart
        this.updateChart(historicalData);
    }

    performAnalysis(currentMultiplier, history) {
        // Calculate statistics
        const avg = this.calculateAverage(history);
        const max = Math.max(...history);
        const min = Math.min(...history);
        const stdDev = this.calculateStdDev(history, avg);
        const variance = (stdDev / avg) * 100;

        // Detect patterns
        const trend = this.detectTrend(history);
        const cycles = this.detectCycles(history);
        const anomalies = this.detectAnomalies(history, avg, stdDev);

        // Calculate crash probability
        const crashProbability = this.calculateCrashProbability(currentMultiplier, history, avg);

        // Predict next multiplier
        const prediction = this.predictNextMultiplier(history, avg, stdDev, trend);

        // Risk assessment
        const riskLevel = this.assessRisk(variance, crashProbability, currentMultiplier, avg);

        // Confidence score
        const confidence = this.calculateConfidence(history.length, stdDev, variance);

        return {
            avg,
            max,
            min,
            stdDev,
            variance,
            trend,
            cycles,
            anomalies,
            crashProbability,
            prediction,
            riskLevel,
            confidence
        };
    }

    calculateAverage(data) {
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    calculateStdDev(data, avg) {
        const squaredDifferences = data.map(val => Math.pow(val - avg, 2));
        const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / data.length;
        return Math.sqrt(variance);
    }

    detectTrend(history) {
        if (history.length < 3) return 'insufficient';
        
        const recent = history.slice(-3);
        const increasing = recent[0] < recent[1] && recent[1] < recent[2];
        const decreasing = recent[0] > recent[1] && recent[1] > recent[2];

        if (increasing) return 'uptrend';
        if (decreasing) return 'downtrend';
        return 'neutral';
    }

    detectCycles(history) {
        const cycles = [];
        let cycleStart = 0;

        for (let i = 1; i < history.length; i++) {
            if (history[i] < history[i - 1] && history[i - 1] > history[i - 2]) {
                if (cycleStart !== 0) {
                    cycles.push(i - cycleStart);
                }
                cycleStart = i;
            }
        }

        return cycles.length > 0 ? cycles : [history.length];
    }

    detectAnomalies(history, avg, stdDev) {
        const threshold = avg + (2 * stdDev);
        return history.filter(val => val > threshold).length;
    }

    calculateCrashProbability(current, history, avg) {
        // Higher multiplier = higher crash risk
        const riskFactor = (current / avg - 1) * 100;
        const historicalCrashRate = history.filter(x => x < 1.5).length / history.length;
        
        const probability = Math.min(100, 30 + (riskFactor * 2) + (historicalCrashRate * 20));
        return Math.round(probability);
    }

    predictNextMultiplier(history, avg, stdDev, trend) {
        let basePredict = avg;

        // Apply trend adjustment
        if (trend === 'uptrend') {
            basePredict *= 1.15;
        } else if (trend === 'downtrend') {
            basePredict *= 0.85;
        }

        // Add volatility
        const lower = Math.max(1.01, basePredict - stdDev);
        const upper = basePredict + stdDev;

        return {
            lower: lower.toFixed(2),
            predicted: basePredict.toFixed(2),
            upper: upper.toFixed(2)
        };
    }

    assessRisk(variance, crashProb, current, avg) {
        if (variance > 100 || crashProb > 70 || current > (avg * 1.5)) {
            return { level: 'HIGH', color: '#f44336', emoji: '⚠️' };
        } else if (variance > 50 || crashProb > 40 || current > (avg * 1.2)) {
            return { level: 'MEDIUM', color: '#ff9800', emoji: '⚡' };
        }
        return { level: 'LOW', color: '#4caf50', emoji: '✅' };
    }

    calculateConfidence(dataPoints, stdDev, variance) {
        let confidence = 50; // Base confidence
        confidence += Math.min(30, (dataPoints - 3) * 3); // More data = more confidence
        confidence -= Math.min(20, variance / 10); // High variance = less confidence
        return Math.round(Math.max(20, Math.min(95, confidence)));
    }

    displayResults(roundId, multiplier, analysis, history) {
        document.getElementById('displayRoundId').textContent = roundId;
        document.getElementById('displayMultiplier').textContent = multiplier.toFixed(2);
        document.getElementById('volatilityRisk').textContent = `${analysis.variance.toFixed(2)}%`;

        document.getElementById('avgMultiplier').textContent = analysis.avg.toFixed(3);
        document.getElementById('maxMultiplier').textContent = analysis.max.toFixed(3);
        document.getElementById('minMultiplier').textContent = analysis.min.toFixed(3);
        document.getElementById('stdDev').textContent = analysis.stdDev.toFixed(3);

        document.getElementById('predictedRange').textContent = 
            `${analysis.prediction.lower}x - ${analysis.prediction.upper}x`;
        document.getElementById('confidenceLevel').textContent = `${analysis.confidence}%`;
        document.getElementById('riskAssessment').textContent = 
            `${analysis.riskLevel.emoji} ${analysis.riskLevel.level}`;

        // Generate recommendations
        const recommendations = this.generateRecommendations(analysis, multiplier);
        const recContainer = document.getElementById('recommendations');
        recContainer.innerHTML = recommendations.map(rec => 
            `<div class="recommendation-item ${rec.type}">${rec.icon} ${rec.text}</div>`
        ).join('');

        // Show results
        document.getElementById('resultsContainer').classList.remove('hidden');
        document.getElementById('emptyState').classList.add('hidden');
    }

    generateRecommendations(analysis, currentMultiplier) {
        const recs = [];

        if (analysis.riskLevel.level === 'HIGH') {
            recs.push({
                type: 'alert',
                icon: '🚨',
                text: 'HIGH RISK: Consider reducing bet size or waiting for better conditions'
            });
        }

        if (analysis.crashProbability > 60) {
            recs.push({
                type: 'caution',
                icon: '⚠️',
                text: `High crash probability (${analysis.crashProbability}%) - Use cash out feature early`
            });
        }

        if (analysis.trend === 'uptrend') {
            recs.push({
                type: 'success',
                icon: '📈',
                text: 'Uptrend detected - Good time to increase stake gradually'
            });
        }

        if (analysis.trend === 'downtrend') {
            recs.push({
                type: 'caution',
                icon: '📉',
                text: 'Downtrend detected - Wait for reversal signal before betting'
            });
        }

        if (currentMultiplier > analysis.avg * 1.3) {
            recs.push({
                type: 'alert',
                icon: '🎲',
                text: 'Current multiplier significantly above average - High volatility expected'
            });
        }

        recs.push({
            type: 'success',
            icon: '💡',
            text: `Next round likely between ${analysis.prediction.lower}x - ${analysis.prediction.upper}x`
        });

        return recs.length > 0 ? recs : [{
            type: 'success',
            icon: '✅',
            text: 'Conditions appear normal - Follow your strategy'
        }];
    }

    updateChart(history) {
        const ctx = document.getElementById('multiplierChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, i) => `Round ${i + 1}`),
                datasets: [{
                    label: 'Multiplier Value',
                    data: history,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Average',
                    data: Array(history.length).fill(this.calculateAverage(history)),
                    borderColor: '#ff9800',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'x' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    addToHistory(roundId, multiplier) {
        this.history.push({
            roundId,
            multiplier,
            timestamp: new Date().toLocaleString(),
            status: multiplier > 1.5 ? 'Won' : 'Low'
        });

        this.updateHistoryTable();
        this.saveToLocalStorage();
    }

    updateHistoryTable() {
        if (this.history.length === 0) return;

        const tbody = document.getElementById('historyBody');
        tbody.innerHTML = this.history.map(item => `
            <tr>
                <td><code>${item.roundId}</code></td>
                <td><strong>x${item.multiplier.toFixed(2)}</strong></td>
                <td>${item.status}</td>
                <td>${item.timestamp}</td>
            </tr>
        `).join('');

        document.getElementById('historyTable').classList.remove('hidden');
        document.getElementById('emptyHistory').classList.add('hidden');
    }

    saveToLocalStorage() {
        localStorage.setItem('aviatorHistory', JSON.stringify(this.history));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('aviatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.updateHistoryTable();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AviatorPredictor();
});