/**
 * MagoArab OrderActions Dynamic Menu Filter
 * Specifically targets the Change Order Status submenu and other dynamic action items
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';
    
    return function (config) {
        if (!config.isEnabled) {
            return;
        }
        
        var permissions = config.permissions || {};
        
        // Initialize on document ready
        $(document).ready(function() {
            setupWatchers();
            setTimeout(processMenuItems, 500);
            setTimeout(processMenuItems, 2000); // Run again after delay to catch late-loaded items
        });
        
        // Set up mutation observers and event watchers
        function setupWatchers() {
            // Watch for menu open events
            $(document).on('click', '.action-menu-items ul.action-menu li._parent > span', function() {
                setTimeout(function() {
                    processSubmenuItems();
                }, 100);
            });
            
            // Watch for direct DOM mutations
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        setTimeout(processMenuItems, 50);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Process all action menu items
        function processMenuItems() {
            // Process main actions menu
            $('.action-menu-items ul.action-menu > li').each(function() {
                var $item = $(this);
                var $span = $item.find('> span.action-menu-item');
                var text = $span.text().trim();
                var actionId = normalizeActionId(text);
                
                if (actionId === 'change_order_status') {
                    if (!isActionAllowed('change_status')) {
                        hideMenuItem($item);
                    } else {
                        // If change status is allowed, process its submenu
                        processSubmenuItems();
                    }
                } else {
                    // Check for standard actions
                    if (!isActionAllowed(actionId)) {
                        hideMenuItem($item);
                    }
                }
            });
            
            // Process other regular action menus
            $('.admin__data-grid-header-row .action-select-wrap .action-menu li, .action-menu li, .actions-split .dropdown-menu li').each(function() {
                var $item = $(this);
                var text = $item.text().trim();
                var actionId = normalizeActionId(text);
                
                if (!isActionAllowed(actionId)) {
                    hideMenuItem($item);
                }
            });
        }
        
        // Process status submenu items
        function processSubmenuItems() {
            $('.action-submenu li').each(function() {
                var $item = $(this);
                var $span = $item.find('> span.action-menu-item');
                var text = $span.text().trim();
                var actionId = normalizeActionId(text);
                
                // Special handling for numeric status codes
                if (text === '0') {
                    return; // Skip numeric placeholders
                }
                
                // For arabic text items
                if (/[\u0600-\u06FF]/.test(text)) {
                    // These are custom status codes - check if status change is allowed
                    if (!isActionAllowed('change_status')) {
                        hideMenuItem($item);
                    }
                } else {
                    // Standard status changes
                    var statusActionId = 'status_' + actionId;
                    if (!isActionAllowed(statusActionId) && !isActionAllowed('change_status')) {
                        hideMenuItem($item);
                    }
                }
            });
        }
        
        // Helper to hide a menu item
        function hideMenuItem($item) {
            $item.addClass('_hidden magoarab-hidden-action');
            $item.css({
                'display': 'none',
                'visibility': 'hidden',
                'height': '0',
                'overflow': 'hidden'
            });
        }
        
        // Normalize action ID from text
        function normalizeActionId(text) {
            if (!text) return '';
            
            return text.toLowerCase()
                .replace(/[^a-z0-9]/g, '_');
        }
        
        // Check if action is allowed
        function isActionAllowed(actionId) {
            // Direct permission check
            if (permissions[actionId] && permissions[actionId].allowed === false) {
                return false;
            }
            
            // Check common action mappings
            var mappings = {
                'cancel': ['cancel', 'canceled'],
                'hold': ['hold', 'on_hold'],
                'unhold': ['unhold'],
                'create_invoice': ['invoice', 'create_invoice'],
                'print_pdf_invoices': ['print_invoice', 'pdf_invoices'],
                'print_pdf_shipments': ['print_shipment', 'pdf_shipments'],
                'print_pdf_orders': ['print_order', 'pdf_orders'],
                'add_order_comments': ['add_comment', 'comment']
            };
            
            for (var permissionKey in mappings) {
                if (mappings[permissionKey].indexOf(actionId) !== -1) {
                    if (permissions[permissionKey] && permissions[permissionKey].allowed === false) {
                        return false;
                    }
                }
            }
            
            // Default to allowed if not explicitly forbidden
            return true;
        }
    };
});