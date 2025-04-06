/**
 * MagoArab OrderActions Force Filter
 * This script forcefully hides unauthorized items using direct DOM manipulation
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';
    
    return function (config) {
        // Only run if enabled
        if (!config.isEnabled) {
            return;
        }
        
        // Get permissions
        var permissions = config.permissions || {};
        
        // Run immediately and again after a delay
        filterMenus();
        setTimeout(filterMenus, 500);
        setTimeout(filterMenus, 2000);
        
        // Set up click handler for menu triggers
        $(document).on('click', '.actions-split button, .action-select, .action-toggle', function() {
            setTimeout(filterMenus, 50);
        });
        
        /**
         * Filter all menus in the UI
         */
        function filterMenus() {
            // Target the main dropdown menu items
            $('.action-menu-items ul.action-menu > li').each(function() {
                filterMainMenuItem($(this));
            });
            
            // Target the status submenu
            $('.action-submenu > li').each(function() {
                filterStatusMenuItem($(this));
            });
        }
        
        /**
         * Filter a main menu item
         */
        function filterMainMenuItem($item) {
            var $span = $item.find('> span.action-menu-item');
            var text = $span.text().trim();
            
            if (text === 'Change Order Status') {
                if (!isActionAllowed('change_status')) {
                    hideElement($item);
                }
                return;
            }
            
            // Map to action IDs
            var actionMap = {
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
            
            var actionId = actionMap[text] || normalizeText(text);
            
            if (!isActionAllowed(actionId)) {
                hideElement($item);
            }
        }
        
        /**
         * Filter a status submenu item
         */
        function filterStatusMenuItem($item) {
            // If change_status is not allowed, hide all status options
            if (!isActionAllowed('change_status')) {
                hideElement($item);
                return;
            }
            
            // Specific status checks could be added here
        }
        
        /**
         * Check if an action is allowed
         */
        function isActionAllowed(actionId) {
            if (!permissions[actionId]) {
                return true; // Default to allowed
            }
            
            return permissions[actionId].allowed !== false;
        }
        
        /**
         * Hide an element completely
         */
        function hideElement($element) {
            $element.css({
                'display': 'none',
                'visibility': 'hidden',
                'height': '0',
                'padding': '0',
                'margin': '0',
                'overflow': 'hidden'
            }).attr('disabled', 'disabled')
              .addClass('magoarab-hidden-action');
              
            $element.find('a, button, span').css({
                'pointer-events': 'none'
            }).attr('disabled', 'disabled');
        }
        
        /**
         * Normalize text to an action ID
         */
        function normalizeText(text) {
            return text.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
    };
});