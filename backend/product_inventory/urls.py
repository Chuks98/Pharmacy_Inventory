from django.urls import path
from .views import get_categories, get_products, create_category, create_product, get_products_by_category, get_product_by_id, update_product, delete_product, save_pending_order, get_pending_orders, delete_pending_order, save_completed_orders, get_completed_orders, get_today_sales, get_total_sales, get_total_products_quantity, get_low_stock_items, get_expiring_products, get_expired_products, get_pending_orders_number, get_completed_orders_number

urlpatterns = [
    path('create-category/', create_category, name='create-category'),
    path('create-product/', create_product, name='create-product'),
    path('get-categories/', get_categories, name='get-categories'),
    path('get_products/', get_products, name='get-products'),
    path('get_product_by_id/<int:product_id>/', get_product_by_id, name='get-product-by-id'),
    path('get_products_by_category/', get_products_by_category, name='get-products-by-category'),
    path('update_product/<int:product_id>/', update_product, name='update_product'),
    path('delete_product/<int:product_id>/', delete_product, name='delete_product'),
    path('save_pending_order/', save_pending_order, name='save_pending_order'),
    path('get_pending_orders/', get_pending_orders, name='get_pending_orders'),
    path('delete_pending_order/<str:purchase_code>/', delete_pending_order, name='delete_pending_order'),
    path('save_completed_orders/', save_completed_orders, name='save_completed_orders'),
    path('get_completed_orders/', get_completed_orders, name='get_completed_orders'),
    path('get_today_sales/', get_today_sales, name='get_today_sales'),
    path('get_total_sales/', get_total_sales, name='get_total_sales'),
    path('get_total_products_quantity/', get_total_products_quantity, name='get_total_products_quantity'),
    path('get_low_stock_items/<int:threshold>/', get_low_stock_items, name='get_low_stock_items'),
    path('get_expiring_products/', get_expiring_products, name='get_expiring_products'),
    path('get_expired_products/', get_expired_products, name='get_expired_products'),
    path('get_pending_orders_number/', get_pending_orders_number, name='get_pending_orders_number'),
    path('get_completed_orders_number/', get_completed_orders_number, name='get_completed_orders_number'),
]
