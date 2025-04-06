<?php
namespace MagoArab\OrderActions\Block\Adminhtml\Order\Grid;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use MagoArab\OrderActions\Helper\Data as OrderActionsHelper;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;
use Magento\Framework\Module\ModuleListInterface;

// إزالة DataObjectFactory
class ActionsCollector extends Template
{
    /**
     * @var OrderActionsHelper
     */
    protected $helper;
    
    /**
     * @var CacheTypeConfig
     */
    protected $configCache;

    /**
     * @var ModuleListInterface
     */
    protected $moduleList;

    /**
     * @param Context $context
     * @param OrderActionsHelper $helper
     * @param CacheTypeConfig $configCache
     * @param ModuleListInterface $moduleList
     * @param array $data
     */
    public function __construct(
        Context $context,
        OrderActionsHelper $helper,
        CacheTypeConfig $configCache,
        ModuleListInterface $moduleList,
        array $data = []
    ) {
        $this->helper = $helper;
        $this->configCache = $configCache;
        $this->moduleList = $moduleList;
        parent::__construct($context, $data);
    }
    
    /**
     * Collect actions from DOM
     *
     * @return string
     */
    protected function _toHtml()
    {
        if (!$this->helper->isEnabled()) {
            return '';
        }
        
        return '<script type="text/javascript">
            require(["jquery", "MagoArab_OrderActions/js/dynamic-resource-manager"], function($, dynamicResourceManager) {
                $(document).ready(function() {
                    var config = {
                        collectUrl: "' . $this->getUrl('magoarab_orderactions/ajax/collectActions') . '",
                        formKey: window.FORM_KEY,
                        isEnabled: true
                    };
                    dynamicResourceManager.init(config);
                });
            });
        </script>';
    }
}