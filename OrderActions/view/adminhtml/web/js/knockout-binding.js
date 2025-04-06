/**
 * MagoArab OrderActions - Knockout Binding Interceptor
 * هذا الملف يتعامل مباشرة مع Knockout.js لمنع ظهور عناصر القائمة غير المصرح بها
 */
define([
    'jquery',
    'ko',
    'mage/translate'
], function ($, ko, $t) {
    'use strict';
    
    return function (config) {
        // تأكد من تحميل التكوين
        var permissions = config.permissions || {};
        var isEnabled = config.isEnabled || false;
        
        if (!isEnabled) {
            return;
        }
        
        // انتظر حتى يتم تهيئة Knockout بالكامل
        $(document).ready(function() {
            // تخزين نسخة من السلوك الأصلي لـ visible binding
            var originalVisibleBinding = ko.bindingHandlers.visible;
            
            // إعادة تعريف binding الخاص بـ visible
            ko.bindingHandlers.visible = {
                init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var $element = $(element);
                    var menuItemText = '';
                    
                    // الحصول على نص عنصر القائمة
                    var $actionMenuItem = $element.find('.action-menu-item');
                    if ($actionMenuItem.length) {
                        menuItemText = $actionMenuItem.text().trim();
                    } else {
                        menuItemText = $element.text().trim();
                    }
                    
                    // فحص العناصر الموجودة داخل القائمة
                    if ($element.closest('.action-menu').length || $element.closest('.action-submenu').length) {
                        var actionId = normalizeActionId(menuItemText);
                        
                        // فحص الإذن المطلوب
                        if (actionId && !isActionAllowed(actionId, menuItemText)) {
                            // إذا كان غير مسموح به، عدل القيمة وأخفِ العنصر
                            var value = valueAccessor();
                            var unwrappedValue = ko.unwrap(value);
                            
                            // إذا كان العنصر مرئيًا، قم بتغييره ليكون مخفيًا
                            if (unwrappedValue) {
                                // إذا كان observable، قم بتعديله
                                if (ko.isObservable(value)) {
                                    value(false);
                                }
                                
                                // أخفِ العنصر باستخدام CSS على أي حال للتأكد
                                hideElement($element);
                                return;
                            }
                        }
                    }
                    
                    // استدعاء السلوك الأصلي للـ binding
                    if (originalVisibleBinding && originalVisibleBinding.init) {
                        originalVisibleBinding.init(element, valueAccessor, allBindings, viewModel, bindingContext);
                    }
                },
                
                update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var $element = $(element);
                    var menuItemText = '';
                    
                    // الحصول على نص عنصر القائمة
                    var $actionMenuItem = $element.find('.action-menu-item');
                    if ($actionMenuItem.length) {
                        menuItemText = $actionMenuItem.text().trim();
                    } else {
                        menuItemText = $element.text().trim();
                    }
                    
                    // فحص العناصر الموجودة داخل القائمة
                    if ($element.closest('.action-menu').length || $element.closest('.action-submenu').length) {
                        var actionId = normalizeActionId(menuItemText);
                        
                        // فحص الإذن المطلوب
                        if (actionId && !isActionAllowed(actionId, menuItemText)) {
                            // إخفاء العنصر دائمًا
                            hideElement($element);
                            return;
                        }
                    }
                    
                    // استدعاء السلوك الأصلي للـ binding
                    if (originalVisibleBinding && originalVisibleBinding.update) {
                        originalVisibleBinding.update(element, valueAccessor, allBindings, viewModel, bindingContext);
                    }
                }
            };
            
            // التعامل مع خاصية css binding أيضًا للتأكيد
            var originalCssBinding = ko.bindingHandlers.css;
            
            ko.bindingHandlers.css = {
                update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var $element = $(element);
                    var menuItemText = '';
                    
                    // الحصول على نص عنصر القائمة
                    var $actionMenuItem = $element.find('.action-menu-item');
                    if ($actionMenuItem.length) {
                        menuItemText = $actionMenuItem.text().trim();
                    } else {
                        menuItemText = $element.text().trim();
                    }
                    
                    // فحص العناصر الموجودة داخل القائمة
                    if ($element.closest('.action-menu').length || $element.closest('.action-submenu').length) {
                        var actionId = normalizeActionId(menuItemText);
                        
                        // فحص الصلاحيات
                        if (actionId && !isActionAllowed(actionId, menuItemText)) {
                            // تعديل classes المطبقة ليصبح العنصر مخفيًا
                            var value = valueAccessor();
                            var css = ko.unwrap(value);
                            
                            if (css._visible === true) {
                                // تغيير قيمة _visible ليصبح false
                                if (ko.isObservable(css._visible)) {
                                    css._visible(false);
                                } else if (ko.isWritableObservable(value)) {
                                    var newCss = $.extend({}, css);
                                    newCss._visible = false;
                                    value(newCss);
                                }
                                
                                // أخفِ العنصر باستخدام CSS
                                hideElement($element);
                                return;
                            }
                        }
                    }
                    
                    // استدعاء السلوك الأصلي
                    if (originalCssBinding && originalCssBinding.update) {
                        originalCssBinding.update(element, valueAccessor, allBindings, viewModel, bindingContext);
                    }
                }
            };
            
            // تعامل مع رابط i18n أيضًا
            var originalI18nBinding = ko.bindingHandlers.i18n;
            
            ko.bindingHandlers.i18n = {
                update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    // استدعاء السلوك الأصلي أولاً
                    if (originalI18nBinding && originalI18nBinding.update) {
                        originalI18nBinding.update(element, valueAccessor, allBindings, viewModel, bindingContext);
                    }
                    
                    // ثم تحقق من النص بعد تطبيق الترجمة
                    var $element = $(element);
                    var menuItemText = $element.text().trim();
                    
                    if ($element.closest('.action-menu').length || $element.closest('.action-submenu').length || 
                        $element.closest('li').closest('.action-menu').length || 
                        $element.closest('li').closest('.action-submenu').length) {
                        
                        var actionId = normalizeActionId(menuItemText);
                        
                        // فحص الصلاحيات
                        if (actionId && !isActionAllowed(actionId, menuItemText)) {
                            // أخفِ العنصر الأب (li) إذا كان موجودًا
                            var $parentLi = $element.closest('li');
                            if ($parentLi.length) {
                                hideElement($parentLi);
                            } else {
                                hideElement($element);
                            }
                        }
                    }
                }
            };
        });
        
        /**
         * تحويل نص إلى معرف فعل
         */
        function normalizeActionId(text) {
            if (!text) return '';
            
            return text.toLowerCase()
                .replace(/[^a-z0-9]/g, '_');
        }
        
        /**
         * فحص ما إذا كان الفعل مسموحًا به
         */
        function isActionAllowed(actionId, originalText) {
            // التحقق من النصوص العربية
            if (/[\u0600-\u06FF]/.test(originalText)) {
                // التحقق من صلاحية change_status
                if (!permissions['change_status'] || permissions['change_status'].allowed === false) {
                    return false;
                }
                return true;
            }
            
            // تعيين الأفعال المعروفة
            var mappings = {
                'change_order_status': 'change_status',
                'create_invoice': 'create_invoice',
                'print_pdf_shipments': 'print_shipment',
                'print_pdf_invoices': 'print_invoice',
                'print_pdf_orders': 'print_order',
                'add_order_comments': 'add_comment',
                'cancel': 'cancel',
                'hold': 'hold',
                'unhold': 'unhold',
                'print_invoices': 'print_invoice',
                'print_packing_slips': 'print_packing',
                'print_credit_memos': 'print_credit_memo',
                'print_all': 'print_all',
                'print_shipping_labels': 'print_shipping'
            };
            
            // التحقق من التعيين أولاً
            if (mappings[actionId] && permissions[mappings[actionId]] && 
                permissions[mappings[actionId]].allowed === false) {
                return false;
            }
            
            // التحقق مباشرة
            if (permissions[actionId] && permissions[actionId].allowed === false) {
                return false;
            }
            
            // عناصر معينة تتبع change_status
            if (actionId === 'change_order_status' || 
                actionId === 'change_status' || 
                originalText === 'Change Order Status' || 
                originalText === 'Change Status') {
                return permissions['change_status'] ? 
                    permissions['change_status'].allowed !== false : true;
            }
            
            // افتراضيًا، الفعل مسموح به
            return true;
        }
        
        /**
         * إخفاء عنصر باستخدام CSS
         */
        function hideElement($element) {
            $element.css({
                'display': 'none !important',
                'visibility': 'hidden !important',
                'opacity': '0 !important',
                'height': '0 !important',
                'width': '0 !important',
                'overflow': 'hidden !important',
                'padding': '0 !important',
                'margin': '0 !important',
                'border': 'none !important'
            }).addClass('_magoarab_hidden');
            
            // أضف سمة مخصصة للاستهداف عبر CSS أيضًا
            $element.attr('data-magoarab-hidden', 'true');
        }
    };
});