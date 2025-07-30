// Display page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentMessage = { line1: 'CONGRATS', line2: 'DES AND SIM', line3: '', line4: '' };
    let messageQueue = [];
    let currentIndex = 0;
    let progress = 0;
    let timeLeft = 25;
    let fastMode = false;
    let timer = null;
    let progressInterval = null;

    const ROTATION_TIME = () => fastMode ? 5000 : 25000; // 5s for testing, 25s for production
    const UPDATE_INTERVAL = 100; // Update progress every 100ms

    // DOM elements
    const line1El = document.getElementById('line1');
    const line2El = document.getElementById('line2');
    const line3El = document.getElementById('line3');
    const line4El = document.getElementById('line4');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const timeLeftEl = document.getElementById('time-left');

    // Load initial queue
    async function loadQueue() {
        try {
            const messages = await API.getMessages();
            messageQueue = messages;
            
            if (messages.length > 0) {
                // Find first unshown message
                const firstUnshown = messages.find(msg => !msg.shown);
                if (firstUnshown) {
                    setCurrentMessage(firstUnshown);
                } else {
                    // No unshown messages, show first shown message (cycling through shown messages)
                    const shownMessages = messages.filter(msg => msg.shown);
                    if (shownMessages.length > 0) {
                        setCurrentMessage(shownMessages[0]);
                    }
                }
            } else {
                // No messages, show default
                setCurrentMessage({ line1: 'CONGRATS', line2: 'DES AND SIM', line3: '', line4: '' });
            }
            
            
        } catch (error) {
            console.error('Error loading queue:', error);
        }
    }

    function setCurrentMessage(message) {
        currentMessage = message;
        
        // Update display
        wrapLettersInSpans(message.line1 || '', line1El);
        
        if (message.line2) {
            wrapLettersInSpans(message.line2, line2El);
            line2El.style.display = 'flex';
        } else {
            line2El.style.display = 'none';
        }
        
        if (message.line3) {
            wrapLettersInSpans(message.line3, line3El);
            line3El.style.display = 'flex';
        } else {
            line3El.style.display = 'none';
        }
        
        if (message.line4) {
            wrapLettersInSpans(message.line4, line4El);
            line4El.style.display = 'flex';
        } else {
            line4El.style.display = 'none';
        }

        // Start timer if there are messages in queue
        if (messageQueue.length > 0 && message.id) {
            startTimer();
        } else {
            stopTimer();
        }
    }

    function startTimer() {
        stopTimer(); // Clear any existing timer
        
        const rotationTime = ROTATION_TIME();
        progress = 0;
        timeLeft = rotationTime / 1000;
        
        progressContainer.style.display = 'flex';
        
        console.log(`Starting ${rotationTime/1000}s timer for message:`, currentMessage.line1);
        
        // Progress bar updater
        progressInterval = setInterval(() => {
            progress += (UPDATE_INTERVAL / rotationTime) * 100;
            timeLeft = Math.ceil((rotationTime - (progress / 100) * rotationTime) / 1000);
            
            progressFill.style.width = `${Math.min(progress, 100)}%`;
            timeLeftEl.textContent = `${Math.max(timeLeft, 0)}s`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, UPDATE_INTERVAL);
        
        // Message rotation timer
        timer = setTimeout(async () => {
            await moveToNextMessage();
        }, rotationTime);
    }

    function stopTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        progressContainer.style.display = 'none';
    }

    async function moveToNextMessage() {
        console.log('Timer completed - moving to next message');
        
        try {
            // Mark current message as shown
            if (currentMessage.id) {
                await API.markMessageShown(currentMessage.id);
            }
            
            // Get fresh queue
            const freshQueue = await API.getMessages();
            messageQueue = freshQueue;
            
            if (freshQueue.length > 0) {
                // Find next unshown message first
                const unshownMessages = freshQueue.filter(msg => !msg.shown);
                const shownMessages = freshQueue.filter(msg => msg.shown);
                
                if (unshownMessages.length > 0) {
                    // Prioritize unshown messages
                    setCurrentMessage(unshownMessages[0]);
                    // Trigger celebration after message is displayed
                    setTimeout(() => {
                        console.log('Showing new unshown message - triggering celebration!');
                        createCelebration('high');
                    }, 500);
                } else if (shownMessages.length > 0) {
                    // No unshown messages, cycle through shown messages
                    // Find current message index in shown messages
                    const currentIndex = shownMessages.findIndex(msg => msg.id === currentMessage.id);
                    const nextIndex = (currentIndex + 1) % shownMessages.length;
                    console.log('No unshown messages - cycling through shown messages');
                    setCurrentMessage(shownMessages[nextIndex]);
                }
            } else {
                // Queue empty, show default
                setCurrentMessage({ line1: 'CONGRATS', line2: 'DES AND SIM', line3: '', line4: '' });
            }
            
            
        } catch (error) {
            console.error('Error moving to next message:', error);
        }
    }


    // Celebration effects using confetti.js
    function createCelebration(intensity = 'high') {
        console.log('Starting confetti celebration with intensity:', intensity);
        
        // Check if confetti is available
        if (typeof confetti === 'undefined') {
            console.error('Confetti library not loaded! Falling back to console message.');
            alert('🎊 CELEBRATION! 🎊');
            return;
        }
        
        console.log('Confetti library found, creating celebration...');
        
        // Test basic confetti first
        try {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
            console.log('Basic confetti test successful');
        } catch (error) {
            console.error('Error with basic confetti test:', error);
            return;
        }
        
        // Configuration based on intensity - toned down
        const configs = {
            low: { particleCount: 30, duration: 4000, spread: 60 },
            medium: { particleCount: 50, duration: 6000, spread: 80 },
            high: { particleCount: 80, duration: 8000, spread: 100 }
        };
        
        const config = configs[intensity] || configs.high;
        const colors = ['#ff0080', '#00ffff', '#9333ea', '#ffd700', '#ffffff'];
        
        // Simple confetti bursts - no stars, classic only
        const waves = 2;
        const totalDuration = config.duration;
        
        for (let wave = 0; wave < waves; wave++) {
            setTimeout(() => {
                // Center burst
                confetti({
                    particleCount: config.particleCount,
                    spread: config.spread,
                    origin: { y: 0.6 },
                    colors: colors,
                    gravity: 0.6,
                    ticks: 200
                });
                
                // Side bursts for variety
                setTimeout(() => {
                    confetti({
                        particleCount: config.particleCount * 0.6,
                        spread: config.spread * 0.8,
                        origin: { x: 0.2, y: 0.7 },
                        colors: colors,
                        gravity: 0.6,
                        ticks: 180
                    });
                    
                    confetti({
                        particleCount: config.particleCount * 0.6,
                        spread: config.spread * 0.8,
                        origin: { x: 0.8, y: 0.7 },
                        colors: colors,
                        gravity: 0.6,
                        ticks: 180
                    });
                }, 400);
                
            }, (wave * totalDuration) / waves);
        }
        
        // Light continuous confetti for duration
        const continuousConfetti = setInterval(() => {
            confetti({
                particleCount: 2,
                spread: 30,
                origin: { 
                    x: 0.3 + Math.random() * 0.4,
                    y: Math.random() * 0.2 
                },
                colors: colors,
                gravity: 0.4,
                ticks: 150
            });
        }, 300);
        
        // Stop continuous confetti after total duration
        setTimeout(() => {
            clearInterval(continuousConfetti);
            console.log('Confetti celebration ended after', totalDuration / 1000, 'seconds');
        }, totalDuration);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'f') {
            fastMode = !fastMode;
            console.log(`Fast mode ${fastMode ? 'ON' : 'OFF'} - Messages will display for ${fastMode ? '5' : '25'} seconds`);
            
            // Restart timer with new duration
            if (timer) {
                startTimer();
            }
        } else if (e.key.toLowerCase() === 'c') {
            // Test confetti manually with very basic settings
            console.log('Manual confetti test triggered with C key');
            
            if (typeof confetti !== 'undefined') {
                console.log('Firing basic confetti...');
                confetti();
                
                setTimeout(() => {
                    console.log('Firing confetti with basic settings...');
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }, 1000);
                
                setTimeout(() => {
                    console.log('Firing confetti from different position...');
                    confetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 }
                    });
                }, 2000);
            } else {
                console.error('Confetti function not available');
            }
        }
    });

    // Poll for new messages every 3 seconds
    setInterval(async () => {
        try {
            const messages = await API.getMessages();
            const oldLength = messageQueue.length;
            messageQueue = messages;
            
            // Trigger celebration if new messages added
            if (messages.length > oldLength) {
                console.log('New message detected - triggering celebration!');
                createCelebration('medium');
            }
            
        } catch (error) {
            console.error('Error polling for messages:', error);
        }
    }, 3000);

    // Poll for celebration triggers every 1 second
    setInterval(async () => {
        try {
            const celebrationData = await API.pollCelebrations();
            
            // Trigger celebration if there are recent triggers
            if (celebrationData.count > 0) {
                console.log('Celebration trigger detected from admin panel!');
                createCelebration('high');
            }
        } catch (error) {
            console.error('Error polling for celebrations:', error);
        }
    }, 1000);

    // Test confetti on page load
    setTimeout(() => {
        console.log('Testing confetti availability on page load...');
        if (typeof confetti !== 'undefined') {
            console.log('✅ Confetti library is available!');
        } else {
            console.error('❌ Confetti library is NOT available!');
        }
    }, 1000);


    // Initialize
    loadQueue();
});