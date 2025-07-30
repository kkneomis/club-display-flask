// Common JavaScript utilities
class API {
    static async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async getMessages() {
        return await this.request('/api/messages');
    }

    static async addMessage(messageData) {
        return await this.request('/api/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    static async markMessageShown(messageId) {
        return await this.request(`/api/messages/${messageId}/shown`, {
            method: 'PUT'
        });
    }

    static async resetAllShown() {
        return await this.request('/api/messages/reset-shown', {
            method: 'POST'
        });
    }

    static async deleteMessage(messageId) {
        return await this.request(`/api/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    static async clearAllMessages() {
        return await this.request('/api/messages', {
            method: 'DELETE'
        });
    }

    static async getStats() {
        return await this.request('/api/stats');
    }

    static async triggerCelebration() {
        return await this.request('/api/celebration', {
            method: 'POST'
        });
    }

    static async pollCelebrations() {
        return await this.request('/api/celebration/poll');
    }
}

// Common utilities
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
}

function wrapLettersInSpans(text, container) {
    container.innerHTML = '';
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        span.style.animationDelay = `${index * 0.1}s`;
        span.style.marginRight = char === ' ' ? '0.5em' : '0';
        container.appendChild(span);
    });
}

// Make API available globally
window.API = API;
window.formatTimestamp = formatTimestamp;
window.wrapLettersInSpans = wrapLettersInSpans;