from django.urls import path
from .views import get_categories, create_category, create_product, get_products_by_category, get_product_by_id, update_product, delete_product

urlpatterns = [
    path('create-category/', create_category, name='create-category'),
    path('create-product/', create_product, name='create-product'),
    path('get-categories/', get_categories, name='get-categories'),
    path('get_product_by_id/<int:product_id>/', get_product_by_id, name='get-product-by-id'),
    path('get_products_by_category/', get_products_by_category, name='get-products-by-category'),
    path('update_product/<int:product_id>/', update_product, name='update_product'),
    path('delete_product/<int:product_id>/', delete_product, name='delete_product')
]
