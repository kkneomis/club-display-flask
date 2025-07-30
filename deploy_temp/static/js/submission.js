// Submission page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('messageForm');
    const inputs = ['line1', 'line2', 'line3', 'line4'];
    const MAX_CHARS = 14;

    // Set up character counters
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(`${inputId}-count`);
        
        input.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = length;
            
            // Update counter color based on character count
            const counterParent = counter.parentElement;
            counterParent.classList.remove('warning', 'danger');
            
            if (length > MAX_CHARS * 0.8) {
                counterParent.classList.add('warning');
            }
            if (length >= MAX_CHARS) {
                counterParent.classList.add('danger');
            }
            
            // Auto-uppercase
            this.value = this.value.toUpperCase();
        });
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const line1 = document.getElementById('line1').value.trim();
        if (!line1) {
            alert('Line 1 is required!');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding to Queue...';

        try {
            const messageData = {
                line1: line1.substring(0, MAX_CHARS),
                line2: document.getElementById('line2').value.trim().substring(0, MAX_CHARS),
                line3: document.getElementById('line3').value.trim().substring(0, MAX_CHARS),
                line4: document.getElementById('line4').value.trim().substring(0, MAX_CHARS)
            };

            const result = await API.addMessage(messageData);
            
            if (result.success) {
                // Show success message
                const successMsg = document.getElementById('success-message');
                const queueInfo = document.getElementById('queue-info');
                
                // Get queue position
                const messages = await API.getMessages();
                const userMessageIndex = messages.findIndex(msg => msg.id === result.id);
                const queuePosition = userMessageIndex + 1;
                const estimatedWait = Math.ceil(queuePosition * 25 / 60); // 25 seconds per message
                
                queueInfo.innerHTML = `
                    <div>📍 Your position in queue: #${queuePosition}</div>
                    <div>⏱️ Estimated wait time: ~${estimatedWait} minute${estimatedWait !== 1 ? 's' : ''}</div>
                `;
                
                successMsg.style.display = 'block';
                
                // Clear form
                inputs.forEach(inputId => {
                    document.getElementById(inputId).value = '';
                    document.getElementById(`${inputId}-count`).textContent = '0';
                });
                
                // Hide success message after 8 seconds
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 8000);
                
            } else {
                throw new Error('Failed to add message');
            }
            
        } catch (error) {
            console.error('Error submitting message:', error);
            alert('Failed to submit message. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});