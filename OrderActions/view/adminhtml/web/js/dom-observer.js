/**
 * MagoArab OrderActions DOM Observer
 * This forcefully hides unauthorized menu items
 */
window.magoarabOrderActionsObserver = {
    init: function(config) {
        // Store config for later use
        this.config = config || {};
        this.permissions = config.permissions || {};
        
        // Initialize observer
        this.setupObserver();
        
        // Process existing elements
        this.processExistingElements();
        
        // Set interval to repeatedly check (to catch any items that might appear later)
        setInterval(this.processExistingElements.bind(this), 1000);
    },
    
    setupObserver: function() {
        var self = this;
        
        // Create mutation observer
        this.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    // Process new nodes
                    setTimeout(function() {
                        self.processExistingElements();
                    }, 10);
                }
            });
        });
        
        // Start observing
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Add click handlers for menu buttons
        document.addEventListener('click', function(e) {
            if (e.target && (
                e.target.classList.contains('action-select') || 
                e.target.closest('.action-select') ||
                e.target.classList.contains('action-toggle') ||
                e.target.closest('.action-toggle')
            )) {
                setTimeout(function() {
                    self.processExistingElements();
                }, 50);
            }
        }, true);
    },
    
    processExistingElements: function() {
        var self = this;
        
        // Process main "Actions" dropdown menu
        var actionMenus = document.querySelectorAll('.action-menu-items ul.action-menu');
        actionMenus.forEach(function(menu) {
            var items = menu.querySelectorAll('li');
            items.forEach(function(item) {
                self.processMenuItem(item);
            });
        });
        
        // Process submenu items
        var submenuItems = document.querySelectorAll('ul.action-submenu li');
        submenuItems.forEach(function(item) {
            self.processStatusMenuItem(item);
        });
    },
    
    processMenuItem: function(item) {
        var span = item.querySelector('span.action-menu-item');
        if (!span) return;
        
        var text = span.textContent.trim();
        var actionId = this.normalizeActionId(text);
        
        // Special case for "Change Order Status"
        if (text === 'Change Order Status') {
            if (!this.isActionAllowed('change_status')) {
                this.hideElement(item);
            }
            return;
        }
        
        // Process standard actions
        var mappings = {
            'Create Invoice': 'create_invoice',
            'Print PDF Shipments': 'print_shipment',
            'Print PDF Invoices': 'print_invoice',
            'Print PDF Orders': 'print_order',
            'Add Order Comments': 'add_comment',
            'Cancel': 'cancel',
            'Hold': 'hold',
            'Unhold': 'unhold',
            'Print Invoices': 'print_invoice',
            'Print Packing Slips': 'print_packing',
            'Print Credit Memos': 'print_creditmemo',
            'Print All': 'print_all',
            'Print Shipping Labels': 'print_shipping'
        };
        
        var permissionId = mappings[text] || actionId;
        if (!this.isActionAllowed(permissionId)) {
            this.hideElement(item);
        }
    },
    
    processStatusMenuItem: function(item) {
        var span = item.querySelector('span.action-menu-item');
        if (!span) return;
        
        var text = span.textContent.trim();
        
        // Skip numeric placeholders
        if (text === '0') return;
        
        // For Arabic text items or any status option
        if (!this.isActionAllowed('change_status')) {
            this.hideElement(item);
        }
    },
    
    normalizeActionId: function(text) {
        if (!text) return '';
        
        return text.toLowerCase()
            .replace(/[^a-z0-9]/g, '_');
    },
    
    isActionAllowed: function(actionId) {
        if (!this.permissions) return true;
        
        // Direct check
        for (var id in this.permissions) {
            if (id === actionId && this.permissions[id].allowed === false) {
                return false;
            }
        }
        
        return true;
    },
    
    hideElement: function(element) {
        if (!element) return;
        
        // Apply multiple hiding techniques
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0';
        element.style.padding = '0';
        element.style.margin = '0';
        element.style.overflow = 'hidden';
        element.classList.add('magoarab-hidden-action');
        
        // Disable any click events
        element.setAttribute('disabled', 'disabled');
        
        // For buttons and links, make them non-clickable
        var clickables = element.querySelectorAll('a, button');
        clickables.forEach(function(el) {
            el.style.pointerEvents = 'none';
            el.setAttribute('disabled', 'disabled');
        });
    }
};

// Initialize as soon as possible
document.addEventListener('DOMContentLoaded', function() {
    // This will be initialized by the template with proper permissions
    if (!window.magoarabOrderActionsObserver.config) {
        window.magoarabOrderActionsObserver.init({});
    }
});