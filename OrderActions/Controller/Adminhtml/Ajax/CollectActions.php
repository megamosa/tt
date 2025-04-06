<?php
/**
 * MagoArab OrderActions AJAX Controller
 *
 * @category  MagoArab
 * @package   MagoArab_OrderActions
 */
namespace MagoArab\OrderActions\Controller\Adminhtml\Ajax;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;
use Psr\Log\LoggerInterface;
use Magento\Framework\Module\ModuleListInterface;

class CollectActions extends Action
{
    /**
     * Authorization level
     */
    const ADMIN_RESOURCE = 'Magento_Sales::sales_order';

    /**
     * @var JsonFactory
     */
    protected $resultJsonFactory;
    
    /**
     * @var CacheTypeConfig
     */
    protected $configCache;
    
    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var ModuleListInterface
     */
    protected $moduleList;

    /**
     * @param Context $context
     * @param JsonFactory $resultJsonFactory
     * @param CacheTypeConfig $configCache
     * @param LoggerInterface $logger
     * @param ModuleListInterface $moduleList
     */
    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        CacheTypeConfig $configCache,
        LoggerInterface $logger,
        ModuleListInterface $moduleList
    ) {
        parent::__construct($context);
        $this->resultJsonFactory = $resultJsonFactory;
        $this->configCache = $configCache;
        $this->logger = $logger;
        $this->moduleList = $moduleList;
    }

    /**
     * Execute action
     *
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $result = $this->resultJsonFactory->create();
        
        try {
            $actions = $this->getRequest()->getParam('actions', []);
            
            if (!empty($actions)) {
                // مسح الأسماء غير المرغوب فيها
                $sanitizedActions = $this->sanitizeActions($actions);
                
                // احصل على الإجراءات الموجودة
                $cachedActions = $this->getCachedActions();
                
                // دمج الإجراءات الجديدة
                $mergedActions = $this->mergeActions($cachedActions, $sanitizedActions);
                
                // حفظ الإجراءات في الذاكرة المؤقتة
                $this->saveActionsToCache($mergedActions);
                
                return $result->setData([
                    'success' => true,
                    'message' => __('تم جمع الإجراءات بنجاح.'),
                    'count' => count($mergedActions)
                ]);
            }
            
            return $result->setData([
                'success' => true,
                'message' => __('لا توجد إجراءات للجمع.'),
                'count' => 0
            ]);
        } catch (\Exception $e) {
            $this->logger->error('خطأ في جمع الإجراءات: ' . $e->getMessage());
            
            return $result->setData([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * تنظيف الإجراءات
     *
     * @param array $actions
     * @return array
     */
    protected function sanitizeActions($actions)
    {
        $sanitized = [];
        $blockedKeywords = ['plugin', 'module', 'admin', 'debug'];
        
        foreach ($actions as $key => $action) {
            // تحويل المفتاح والقيمة إلى حروف صغيرة
            $key = strtolower($key);
            $action = strtolower($action);
            
            // تجنب الكلمات المحظورة
            $isBlocked = array_reduce($blockedKeywords, function($carry, $keyword) use ($key, $action) {
                return $carry || strpos($key, $keyword) !== false || strpos($action, $keyword) !== false;
            }, false);
            
            if (!$isBlocked && strlen($action) > 1) {
                $sanitized[$key] = $action;
            }
        }
        
        return $sanitized;
    }

    /**
     * الحصول على الإجراءات المخزنة
     *
     * @return array
     */
    protected function getCachedActions()
    {
        $cachedData = $this->configCache->load('magoarab_custom_order_actions');
        return $cachedData ? json_decode($cachedData, true) : [];
    }

    /**
     * دمج الإجراءات
     *
     * @param array $existingActions
     * @param array $newActions
     * @return array
     */
    protected function mergeActions($existingActions, $newActions)
    {
        return array_merge($existingActions, $newActions);
    }

    /**
     * حفظ الإجراءات في الذاكرة المؤقتة
     *
     * @param array $actions
     */
    protected function saveActionsToCache($actions)
    {
        $this->configCache->save(
            json_encode($actions),
            'magoarab_custom_order_actions',
            ['CONFIG_CACHE'],
            86400 // 24 ساعة
        );
    }
}