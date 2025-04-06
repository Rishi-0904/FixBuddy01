class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    createToast(type, title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Create icon based on type
        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        icon.innerHTML = this.getIcon(type);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'toast-title';
        titleElement.textContent = title;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'toast-message';
        messageElement.textContent = message;
        
        content.appendChild(titleElement);
        content.appendChild(messageElement);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.removeToast(toast);
        
        // Assemble toast
        toast.appendChild(icon);
        toast.appendChild(content);
        toast.appendChild(closeButton);
        
        // Add to container
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeToast(toast), duration);
        }
        
        this.toasts.push(toast);
        return toast;
    }

    getIcon(type) {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    success(title, message, duration) {
        return this.createToast('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.createToast('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.createToast('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.createToast('info', title, message, duration);
    }
}

// Create global toast instance
window.toast = new Toast(); 