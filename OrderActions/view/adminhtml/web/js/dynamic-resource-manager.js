/**
 * MagoArab OrderActions Dynamic Resource Manager
 */
define([
    'jquery',
    'mage/cookies'
], function ($) {
    'use strict';
    
    return {
        init: function(config) {
            var self = this;
            
            this.config = $.extend({
                collectUrl: '',
                formKey: '',
                isEnabled: true
            }, config);
            
            if (!this.config.isEnabled) {
                return;
            }
            
            $(document).ready(function() {
                setTimeout(function() {
                    self.collectActions();
                }, 2000);
            });
        },
        
        collectActions: function() {
            var actions = this.scanForActions();
            
            if (Object.keys(actions).length > 0) {
                this.sendActionsToServer(actions);
            }
        },
        
        scanForActions: function() {
            var actions = {};
            var scanSelectors = [
                '.admin__action-dropdown-menu li',
                '.action-menu li',
                '.order-actions button',
                '.order-actions-toolbar button',
                '.actions-split .dropdown-menu li',
                '.page-actions-buttons button',
                '.admin__data-grid-header-row .action-select-wrap .action-menu li'
            ];
            
            $(scanSelectors.join(', ')).each(function() {
                var $item = $(this);
                var text = $item.text().trim();
                
                if (text) {
                    var actionId = text.toLowerCase()
                        .replace(/[^a-z0-9]/g, '_')
                        .replace(/__+/g, '_');
                    
                    if (actionId.length > 1 && !actions[actionId]) {
                        actions[actionId] = text;
                    }
                }
            });
            
            return actions;
        },
        
        sendActionsToServer: function(actions) {
            $.ajax({
                url: this.config.collectUrl,
                type: 'POST',
                data: {
                    actions: actions,
                    form_key: this.config.formKey
                },
                dataType: 'json',
                success: function(response) {
                    console.log('تم جمع الإجراءات:', response);
                },
                error: function(xhr, status, error) {
                    console.error('خطأ في جمع الإجراءات:', error);
                }
            });
        }
    };
});