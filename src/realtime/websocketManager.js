/**
 * Real-Time WebSocket Manager
 * Handles WebSocket connections and real-time data streaming
 */

class WebSocketManager {
    constructor(config = {}) {
        this.url = config.url || 'wss://api.aviator-game.com/ws';
        this.reconnectInterval = config.reconnectInterval || 5000;
        this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.listeners = {};
        this.isConnected = false;
        this.messageQueue = [];
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    while (this.messageQueue.length > 0) {
                        const message = this.messageQueue.shift();
                        this.send(message);
                    }
                    this.emit('connect');
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.emit('message', data);
                        if (data.type) {
                            this.emit(`${data.type}`, data);
                        }
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                        this.emit('error', error);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };
                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.emit('disconnect');
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
        }
    }

    send(message) {
        if (this.isConnected && this.ws) {
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Failed to send message:', error);
                this.messageQueue.push(message);
            }
        } else {
            this.messageQueue.push(message);
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for event '${event}':`, error);
                }
            });
        }
    }

    subscribeLiveRounds() {
        this.send({ type: 'subscribe', channel: 'live_rounds' });
    }

    subscribeStats() {
        this.send({ type: 'subscribe', channel: 'game_stats' });
    }

    subscribeMultiplierHistory() {
        this.send({ type: 'subscribe', channel: 'multiplier_history' });
    }

    authenticate(token) {
        this.send({ type: 'auth', token: token });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    isReady() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            readyState: this.ws ? this.ws.readyState : null,
            reconnectAttempts: this.reconnectAttempts,
            messageQueueLength: this.messageQueue.length
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager;
}