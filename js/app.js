/**
 * Neural Network AR Visualizer - Main Application
 * 
 * This file initializes the application, sets up event handlers,
 * and manages the overall application state.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Neural Network AR Visualizer initializing...');
    
    // DOM elements
    const loadingScreen = document.getElementById('loadingScreen');
    const infoPanel = document.getElementById('infoPanel');
    const infoBtn = document.getElementById('infoBtn');
    const infoCloseBtn = document.getElementById('infoCloseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const tutorial = document.getElementById('tutorial');
    const tutorialSteps = Array.from(document.querySelectorAll('.tutorial-step'));
    
    // Application state
    let neuralNetwork = null;
    let arVisualizer = null;
    let currentTutorialStep = 0;
    let arInitialized = false;
    
    // Initialize neural network
    function initializeNeuralNetwork() {
        console.log('Initializing neural network...');
        neuralNetwork = new NeuralNetwork();
        console.log('Neural network initialized with architecture:', neuralNetwork.architecture);
        return neuralNetwork;
    }
    
    // Initialize AR visualization
    function initializeARVisualization() {
        if (!neuralNetwork) {
            console.error('Neural network must be initialized first');
            return;
        }
        
        console.log('Setting up AR visualization...');
        arVisualizer = new ARNeuralNetworkVisualizer(neuralNetwork);
        
        // Wait for AR.js to initialize
        document.addEventListener('arjs-video-loaded', () => {
            console.log('AR.js video loaded - camera access successful');
            hideLoadingScreen();
            showTutorial();
            showInfoPanel(); // Show info panel by default to guide users
        });
        
        // Add a timeout to hide loading screen even if AR.js doesn't initialize properly
        setTimeout(() => {
            console.log('Timeout reached - forcing loading screen to hide');
            hideLoadingScreen();
            showTutorial();
            showInfoPanel();
        }, 5000);
        
        // Wait for marker detection
        document.addEventListener('markerFound', () => {
            console.log('AR marker found - Hiro marker detected');
            if (!arInitialized) {
                console.log('Initializing AR visualization for the first time');
                arVisualizer.initialize();
                arInitialized = true;
                advanceTutorial();
            }
        });
    }
    
    // Hide loading screen
    function hideLoadingScreen() {
        console.log('Hiding loading screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Show info panel
    function showInfoPanel() {
        console.log('Showing info panel');
        infoPanel.style.display = 'block';
    }
    
    // Hide info panel
    function hideInfoPanel() {
        console.log('Hiding info panel');
        infoPanel.style.display = 'none';
    }
    
    // Show tutorial
    function showTutorial() {
        console.log('Showing tutorial');
        tutorial.style.display = 'block';
        updateTutorialStep();
    }
    
    // Hide tutorial
    function hideTutorial() {
        console.log('Hiding tutorial');
        tutorial.style.display = 'none';
    }
    
    // Update tutorial step
    function updateTutorialStep() {
        console.log(`Updating tutorial to step ${currentTutorialStep + 1}`);
        tutorialSteps.forEach((step, index) => {
            if (index === currentTutorialStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Advance to next tutorial step
    function advanceTutorial() {
        currentTutorialStep++;
        console.log(`Advanced to tutorial step ${currentTutorialStep + 1}`);
        
        if (currentTutorialStep >= tutorialSteps.length) {
            // End of tutorial
            console.log('Tutorial completed');
            setTimeout(() => {
                hideTutorial();
            }, 3000);
            return;
        }
        
        updateTutorialStep();
    }
    
    // Reset visualization
    function resetVisualization() {
        console.log('Resetting visualization');
        if (arVisualizer) {
            arVisualizer.dispose();
        }
        
        if (neuralNetwork) {
            neuralNetwork.stopInferenceAnimation();
        }
        
        // Reinitialize
        neuralNetwork = initializeNeuralNetwork();
        arVisualizer = new ARNeuralNetworkVisualizer(neuralNetwork);
        arInitialized = false;
        
        // Show first tutorial step
        currentTutorialStep = 0;
        showTutorial();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Info button
        infoBtn.addEventListener('click', () => {
            showInfoPanel();
        });
        
        // Info close button
        infoCloseBtn.addEventListener('click', () => {
            hideInfoPanel();
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            resetVisualization();
        });
        
        // Handle device orientation changes
        window.addEventListener('orientationchange', () => {
            console.log('Device orientation changed');
            // Give the browser time to adjust
            setTimeout(() => {
                if (arVisualizer && arInitialized) {
                    // Reinitialize AR visualization on orientation change
                    console.log('Reinitializing AR visualization after orientation change');
                    arVisualizer.dispose();
                    arVisualizer = new ARNeuralNetworkVisualizer(neuralNetwork);
                    arVisualizer.initialize();
                }
            }, 500);
        });
        
        // Handle clicks on neurons for future interaction
        document.addEventListener('click', (event) => {
            // Check if we clicked on a neuron
            if (event.target.tagName === 'A-SPHERE' && event.target.dataset.layerIndex) {
                const layerIndex = parseInt(event.target.dataset.layerIndex);
                const neuronIndex = parseInt(event.target.dataset.neuronIndex);
                
                console.log(`Clicked on neuron: Layer ${layerIndex}, Neuron ${neuronIndex}`);
                
                // Advance tutorial if we're on the last step
                if (currentTutorialStep === 2) {
                    advanceTutorial();
                }
            }
        });
    }
    
    // Handle errors
    function handleErrors() {
        console.log('Setting up error handlers');
        
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <h2>Something went wrong</h2>
                <p>Error: ${event.error ? event.error.message : 'Unknown error'}</p>
                <p>Please try refreshing the page or use a different device.</p>
                <button id="errorCloseBtn">Close</button>
            `;
            
            document.body.appendChild(errorMessage);
            
            // Close error message
            document.getElementById('errorCloseBtn').addEventListener('click', () => {
                document.body.removeChild(errorMessage);
            });
        });
    }
    
    // Check device compatibility
    function checkCompatibility() {
        console.log('Checking device compatibility');
        
        // Check for WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            // WebGL not supported
            console.error('WebGL not supported');
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <h1>Device Not Compatible</h1>
                    <p>Your device does not support WebGL, which is required for this AR experience.</p>
                    <p>Please try using a different device or browser.</p>
                </div>
            `;
            return false;
        }
        
        // Check for camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            // Camera access not supported
            console.error('Camera access not supported');
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <h1>Camera Access Required</h1>
                    <p>This AR experience requires camera access, which is not supported by your browser.</p>
                    <p>Please try using a different device or browser.</p>
                </div>
            `;
            return false;
        }
        
        console.log('Device compatibility check passed');
        return true;
    }
    
    // Initialize application
    function initializeApp() {
        console.log('Starting application initialization');
        
        // Check device compatibility
        if (!checkCompatibility()) {
            return;
        }
        
        // Initialize components
        initializeNeuralNetwork();
        initializeARVisualization();
        
        // Set up event listeners
        setupEventListeners();
        
        // Handle errors
        handleErrors();
        
        console.log('Application initialization complete');
    }
    
    // Start the application
    initializeApp();
});

// Add a custom marker detection event for AR.js
AFRAME.registerComponent('markerhandler', {
    init: function() {
        console.log('Marker handler component initialized');
        
        // Add debug message to confirm component is attached
        console.log('Marker handler attached to:', this.el.id);
        
        this.el.addEventListener('markerFound', () => {
            console.log('Marker found event triggered');
            document.dispatchEvent(new Event('markerFound'));
        });
        
        this.el.addEventListener('markerLost', () => {
            console.log('Marker lost event triggered');
        });
    }
}); 