export const ui = {
    formatPrice(amount: number | string): string {
        const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(parsed) ? '0.00 ₴' : `${parsed.toFixed(2)} ₴`;
    },

    showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
        const toast = document.createElement('div');

        const bgColors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#ea580c'
        };

        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.color = '#fff';
        toast.style.backgroundColor = bgColors[type];
        toast.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        toast.innerText = message;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderLoading(container: HTMLElement | null, message: string = 'Loading...') {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6b7280; width: 100%;">
                    <p>${message}</p>
                </div>
            `;
        }
    },

    renderEmpty(container: HTMLElement | null, message: string) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #9ca3af; width: 100%;">
                    <p class="empty-msg">${message}</p>
                </div>
            `;
        }
    }
};