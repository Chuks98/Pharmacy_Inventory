from django.contrib import admin
from .models import Product, Category  # Import your models

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category')  # Customize what fields to display
    search_fields = ('name', 'category__name')  # Add search functionality
    list_filter = ('category',)  # Add filters for categories

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)  # Customize what fields to display
    search_fields = ('name',)  # Add search functionality
