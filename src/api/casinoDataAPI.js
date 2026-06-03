/**
 * Real Casino Data API Integration
 * Handles API connections with real-time multiplier data
 */

class CasinoDataAPI {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'https://api.aviator-game.com';
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 10000;
        this.cache = {};
        this.subscribers = [];
        this.wsConnection = null;
    }

    async fetchLiveRound() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/rounds/current`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: this.timeout
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            this.cache['currentRound'] = data;
            return data;
        } catch (error) {
            console.error('Failed to fetch live round:', error);
            return this.cache['currentRound'] || null;
        }
    }

    async fetchHistory(limit = 100, offset = 0) {
        try {
            const response = await fetch(
                `${this.baseURL}/api/v1/rounds/history?limit=${limit}&offset=${offset}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    timeout: this.timeout
                }
            );
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            this.cache['history'] = data;
            return data.rounds || [];
        } catch (error) {
            console.error('Failed to fetch history:', error);
            return this.cache['history']?.rounds || [];
        }
    }

    async fetchGameStats(gameId, timeRange = '24h') {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/stats/${gameId}?range=${timeRange}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: this.timeout
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch game stats:', error);
            return null;
        }
    }

    async fetchCorrelationData() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/correlation/multi-game`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: this.timeout
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch correlation data:', error);
            return null;
        }
    }

    connectWebSocket(onMessage, onError, onConnect) {
        try {
            const wsURL = this.baseURL.replace(/^http/, 'ws') + '/ws/live';
            this.wsConnection = new WebSocket(wsURL);
            this.wsConnection.onopen = () => {
                console.log('WebSocket connected');
                if (this.apiKey) {
                    this.wsConnection.send(JSON.stringify({ type: 'auth', token: this.apiKey }));
                }
                onConnect && onConnect();
            };
            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                    this.notifySubscribers(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError && onError(error);
            };
            this.wsConnection.onclose = () => {
                console.log('WebSocket disconnected');
                setTimeout(() => this.connectWebSocket(onMessage, onError, onConnect), 5000);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            onError && onError(error);
        }
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notifySubscribers(data) {
        this.subscribers.forEach(callback => {
            try { callback(data); } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });
    }

    disconnectWebSocket() {
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
    }

    async getAggregatedData() {
        const [current, history, stats, correlation] = await Promise.all([
            this.fetchLiveRound(),
            this.fetchHistory(50),
            this.fetchGameStats('aviator', '24h'),
            this.fetchCorrelationData()
        ]);
        return {
            currentRound: current,
            history: history,
            stats: stats,
            correlation: correlation,
            timestamp: new Date().toISOString()
        };
    }

    async validateConnection() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/health`, { timeout: 5000 });
            return response.ok;
        } catch (error) {
            console.error('API connection validation failed:', error);
            return false;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasinoDataAPI;
}