/**
 * Bankroll Management System
 * Implements Kelly Criterion and portfolio management strategies
 */

class BankrollManager {
    constructor(initialBankroll = 1000) {
        this.initialBankroll = initialBankroll;
        this.currentBankroll = initialBankroll;
        this.totalBets = 0;
        this.totalWins = 0;
        this.totalLosses = 0;
        this.bets = [];
        this.sessions = [];
        this.riskPercentage = 0.05;
        this.maxLossPerSession = 0.10;
        this.currentSession = this.createSession();
    }

    createSession() {
        return {
            startTime: Date.now(),
            startBankroll: this.currentBankroll,
            bets: [],
            profit: 0,
            numberOfBets: 0
        };
    }

    calculateKellyCriterion(winProbability, odds) {
        const p = winProbability / 100;
        const q = 1 - p;
        const b = odds - 1;
        const kellyCriterion = (b * p - q) / b;
        return Math.max(0, Math.min(kellyCriterion * this.riskPercentage, 0.25));
    }

    calculateOptimalBetSize(winProbability, odds) {
        const kellyCriterion = this.calculateKellyCriterion(winProbability, odds);
        const betSize = this.currentBankroll * kellyCriterion;
        return Math.max(1, Math.round(betSize * 100) / 100);
    }

    placeBet(amount, prediction, multiplier) {
        if (amount > this.currentBankroll) {
            console.warn('Bet amount exceeds bankroll');
            return null;
        }
        const bet = {
            amount,
            prediction,
            multiplier,
            timestamp: Date.now(),
            status: 'pending',
            result: null
        };
        this.bets.push(bet);
        this.totalBets += amount;
        this.currentSession.bets.push(bet);
        this.currentSession.numberOfBets++;
        return bet;
    }

    settleBet(betId, result, actualMultiplier) {
        const bet = this.bets.find(b => b === betId || this.bets.indexOf(b) === betId);
        if (!bet) {
            console.error('Bet not found');
            return null;
        }
        bet.status = 'settled';
        bet.result = result;
        bet.actualMultiplier = actualMultiplier;
        bet.settledTime = Date.now();
        if (result === 'win') {
            const winAmount = bet.amount * actualMultiplier;
            this.currentBankroll += (winAmount - bet.amount);
            this.totalWins += winAmount - bet.amount;
        } else if (result === 'loss') {
            this.currentBankroll -= bet.amount;
            this.totalLosses += bet.amount;
        }
        this.currentSession.profit = this.currentBankroll - this.currentSession.startBankroll;
        return bet;
    }

    getWinRate() {
        const settledBets = this.bets.filter(b => b.status === 'settled');
        if (settledBets.length === 0) return 0;
        const wins = settledBets.filter(b => b.result === 'win').length;
        return (wins / settledBets.length) * 100;
    }

    getROI() {
        if (this.totalBets === 0) return 0;
        const profit = this.currentBankroll - this.initialBankroll;
        return (profit / this.totalBets) * 100;
    }

    getStatistics() {
        const settledBets = this.bets.filter(b => b.status === 'settled');
        return {
            currentBankroll: Math.round(this.currentBankroll * 100) / 100,
            initialBankroll: this.initialBankroll,
            totalProfit: Math.round((this.currentBankroll - this.initialBankroll) * 100) / 100,
            totalBets: this.totalBets,
            winRate: this.getWinRate().toFixed(2) + '%',
            roi: this.getROI().toFixed(2) + '%',
            totalWins: Math.round(this.totalWins * 100) / 100,
            totalLosses: Math.round(this.totalLosses * 100) / 100,
            numberOfBets: settledBets.length,
            averageBetSize: settledBets.length > 0 ? Math.round(this.totalBets / settledBets.length * 100) / 100 : 0
        };
    }

    endSession() {
        this.sessions.push(this.currentSession);
        this.currentSession = this.createSession();
    }

    serialize() {
        return {
            initialBankroll: this.initialBankroll,
            currentBankroll: this.currentBankroll,
            totalBets: this.totalBets,
            totalWins: this.totalWins,
            totalLosses: this.totalLosses,
            bets: this.bets,
            sessions: this.sessions,
            riskPercentage: this.riskPercentage
        };
    }

    deserialize(data) {
        this.initialBankroll = data.initialBankroll;
        this.currentBankroll = data.currentBankroll;
        this.totalBets = data.totalBets;
        this.totalWins = data.totalWins;
        this.totalLosses = data.totalLosses;
        this.bets = data.bets;
        this.sessions = data.sessions;
        this.riskPercentage = data.riskPercentage;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BankrollManager;
}