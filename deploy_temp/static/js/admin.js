// Admin page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let messageQueue = [];
    let stats = {};

    // DOM elements
    const totalSubmittedEl = document.getElementById('total-submitted');
    const messagesDisplayedEl = document.getElementById('messages-displayed');
    const inQueueEl = document.getElementById('in-queue');
    const queueCountEl = document.getElementById('queue-count');
    const emptyQueueEl = document.getElementById('empty-queue');
    const messageListEl = document.getElementById('message-list');
    const triggerCelebrationBtn = document.getElementById('trigger-celebration');
    const clearAllBtn = document.getElementById('clear-all');

    // Load data
    async function loadData() {
        try {
            // Load messages and stats in parallel
            const [messages, statsData] = await Promise.all([
                API.getMessages(),
                API.getStats()
            ]);
            
            messageQueue = messages;
            stats = statsData;
            
            updateUI();
            
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    function updateUI() {
        // Update stats
        totalSubmittedEl.textContent = stats.total_submitted || 0;
        messagesDisplayedEl.textContent = stats.shown_messages || 0;
        inQueueEl.textContent = messageQueue.length;
        queueCountEl.textContent = messageQueue.length;
        
        // Update queue display
        if (messageQueue.length === 0) {
            emptyQueueEl.style.display = 'block';
            messageListEl.style.display = 'none';
            clearAllBtn.disabled = true;
        } else {
            emptyQueueEl.style.display = 'none';
            messageListEl.style.display = 'block';
            clearAllBtn.disabled = false;
            renderMessageList();
        }
    }

    function renderMessageList() {
        messageListEl.innerHTML = '';
        
        messageQueue.forEach((message, index) => {
            const messageCard = document.createElement('div');
            messageCard.className = `message-card ${index === 0 ? 'current' : ''}`;
            
            messageCard.innerHTML = `
                <div class="message-header">
                    <span class="message-position">#${index + 1}</span>
                    <span class="message-time">${formatTimestamp(message.timestamp)}</span>
                    <span class="status-badge ${message.shown ? 'shown' : 'unshown'}">
                        ${message.shown ? 'Shown' : 'Unshown'}
                    </span>
                    ${index === 0 ? '<span class="current-badge">Currently Displaying</span>' : ''}
                </div>
                
                <div class="message-content">
                    <div class="message-line">${message.line1}</div>
                    ${message.line2 ? `<div class="message-line">${message.line2}</div>` : ''}
                    ${message.line3 ? `<div class="message-line">${message.line3}</div>` : ''}
                    ${message.line4 ? `<div class="message-line">${message.line4}</div>` : ''}
                </div>

                <div class="message-actions">
                    <button class="remove-btn" onclick="removeMessage(${message.id})" title="Remove message">
                        🗑️ Remove
                    </button>
                </div>
            `;
            
            messageListEl.appendChild(messageCard);
        });
    }

    // Event handlers
    triggerCelebrationBtn.addEventListener('click', async function() {
        try {
            await API.triggerCelebration();
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            console.log('Celebration triggered!');
        } catch (error) {
            console.error('Error triggering celebration:', error);
        }
    });

    clearAllBtn.addEventListener('click', async function() {
        if (!confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
            return;
        }
        
        try {
            this.disabled = true;
            this.textContent = 'Clearing...';
            
            await API.clearAllMessages();
            await loadData(); // Refresh data
            
            console.log('All messages cleared');
        } catch (error) {
            console.error('Error clearing messages:', error);
            alert('Failed to clear messages. Please try again.');
        } finally {
            this.disabled = false;
            this.textContent = 'Clear All Messages';
        }
    });

    // Global function for remove buttons
    window.removeMessage = async function(messageId) {
        if (!confirm('Are you sure you want to remove this message?')) {
            return;
        }
        
        try {
            await API.deleteMessage(messageId);
            await loadData(); // Refresh data
            console.log(`Message ${messageId} removed`);
        } catch (error) {
            console.error('Error removing message:', error);
            alert('Failed to remove message. Please try again.');
        }
    };

    // Auto-refresh every 2 seconds
    setInterval(loadData, 2000);

    // Initialize
    loadData();
});