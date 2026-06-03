/**
 * Neural Network ML Engine for Aviator Prediction
 * Implements multi-layer perceptron with backpropagation
 */

class NeuralNetwork {
    constructor(layers = [10, 16, 8, 3]) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.learningRate = 0.01;
        this.momentum = 0.9;
        this.weightVelocity = [];
        this.biasVelocity = [];
        
        this.initializeWeights();
    }

    /**
     * Xavier initialization for weights
     */
    initializeWeights() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputSize = this.layers[i];
            const outputSize = this.layers[i + 1];
            
            const limit = Math.sqrt(6 / (inputSize + outputSize));
            this.weights[i] = this.randomMatrix(inputSize, outputSize, limit);
            this.biases[i] = this.zeros(outputSize);
            this.weightVelocity[i] = this.zeros(inputSize * outputSize);
            this.biasVelocity[i] = this.zeros(outputSize);
        }
    }

    /**
     * Random matrix initialization
     */
    randomMatrix(rows, cols, limit) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() * 2 - 1) * limit;
            }
        }
        return matrix;
    }

    /**
     * Zero matrix initialization
     */
    zeros(size) {
        return new Array(size).fill(0);
    }

    /**
     * ReLU activation function
     */
    relu(x) {
        return Math.max(0, x);
    }

    /**
     * ReLU derivative
     */
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    /**
     * Sigmoid activation function
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
    }

    /**
     * Sigmoid derivative
     */
    sigmoidDerivative(x) {
        const s = this.sigmoid(x);
        return s * (1 - s);
    }

    /**
     * Forward pass through network
     */
    forward(input) {
        this.activations = [input];
        this.preActivations = [];
        
        let current = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            const preActivation = this.matrixVectorMultiply(
                this.weights[i],
                current,
                this.biases[i]
            );
            this.preActivations[i] = preActivation;
            
            const isLastLayer = i === this.weights.length - 1;
            current = isLastLayer 
                ? preActivation.map(x => this.sigmoid(x))
                : preActivation.map(x => this.relu(x));
            
            this.activations[i + 1] = current;
        }
        
        return current;
    }

    /**
     * Matrix-vector multiplication with bias
     */
    matrixVectorMultiply(matrix, vector, bias) {
        return matrix.map(row => 
            row.reduce((sum, weight, j) => sum + weight * vector[j], 0) + bias[0]
        );
    }

    /**
     * Backward pass through network
     */
    backward(input, output, targetOutput) {
        const errors = [];
        
        // Output layer error
        const outputError = output.map((o, i) => o - targetOutput[i]);
        errors[this.layers.length - 1] = outputError;
        
        // Backpropagate errors
        for (let i = this.layers.length - 2; i >= 0; i--) {
            const nextError = [];
            for (let j = 0; j < this.layers[i]; j++) {
                let error = 0;
                for (let k = 0; k < errors[i + 1].length; k++) {
                    error += errors[i + 1][k] * this.weights[i][j][k];
                }
                const isLastHidden = i === this.layers.length - 2;
                nextError[j] = error * (isLastHidden ? 
                    this.sigmoidDerivative(this.preActivations[i][j]) :
                    this.reluDerivative(this.preActivations[i][j])
                );
            }
            errors[i] = nextError;
        }
        
        // Update weights and biases
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    const gradient = errors[i + 1][k] * this.activations[i][j];
                    this.weightVelocity[i][j * this.weights[i][j].length + k] = 
                        this.momentum * this.weightVelocity[i][j * this.weights[i][j].length + k] -
                        this.learningRate * gradient;
                    this.weights[i][j][k] += this.weightVelocity[i][j * this.weights[i][j].length + k];
                }
            }
            for (let j = 0; j < this.biases[i].length; j++) {
                this.biasVelocity[i][j] = 
                    this.momentum * this.biasVelocity[i][j] -
                    this.learningRate * errors[i + 1][j];
                this.biases[i][j] += this.biasVelocity[i][j];
            }
        }
    }

    /**
     * Train the network
     */
    train(trainingData, epochs = 100) {
        const losses = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            for (const { input, output: target } of trainingData) {
                const output = this.forward(input);
                this.backward(input, output, target);
                const loss = output.reduce((sum, o, i) => sum + Math.pow(o - target[i], 2), 0) / output.length;
                totalLoss += loss;
            }
            losses.push(totalLoss / trainingData.length);
        }
        return losses;
    }

    /**
     * Make prediction
     */
    predict(input) {
        return this.forward(input);
    }

    /**
     * Save model state
     */
    serialize() {
        return {
            layers: this.layers,
            weights: this.weights,
            biases: this.biases,
            learningRate: this.learningRate
        };
    }

    /**
     * Load model state
     */
    deserialize(data) {
        this.layers = data.layers;
        this.weights = data.weights;
        this.biases = data.biases;
        this.learningRate = data.learningRate;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralNetwork;
}