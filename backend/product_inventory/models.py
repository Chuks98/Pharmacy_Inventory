from django.db import models
from .auto_increment_field import AutoIncrementField


class Category(models.Model):
    id = AutoIncrementField(sequence_name='my_model_sequence', primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    staff_id = models.CharField(max_length=255, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)  # Added date_created field

    def __str__(self):
        return self.name


class Product(models.Model):
    id = AutoIncrementField(sequence_name='my_model_sequence', primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    availableQuantity = models.PositiveIntegerField()
    categoryName = models.CharField(max_length=255, null=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)  # Added date_created field
    staff_id = models.CharField(max_length=255, blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)  # New expiry date field

    def __str__(self):
        return self.name
    