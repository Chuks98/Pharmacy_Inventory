# from django.db import models
# from users.models import CustomUser

# class Category(models.Model):
#     name = models.CharField(max_length=100)
#     description = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return self.name

# class Supplier(models.Model):
#     name = models.CharField(max_length=255)
#     contact_name = models.CharField(max_length=255)
#     phone = models.CharField(max_length=20)
#     email = models.EmailField()
#     address = models.TextField()

#     def __str__(self):
#         return self.name

# class Product(models.Model):
#     name = models.CharField(max_length=255)
#     description = models.TextField()
#     category = models.ForeignKey(Category, on_delete=models.CASCADE)
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     cost_price = models.DecimalField(max_digits=10, decimal_places=2)
#     stock = models.IntegerField()
#     expiry_date = models.DateField(null=True, blank=True)
#     supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)
#     barcode = models.CharField(max_length=100, unique=True)
#     date_added = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

# class InventoryTransaction(models.Model):
#     TRANSACTION_TYPES = [
#         ('purchase', 'Purchase'),
#         ('sale', 'Sale'),
#         ('restock', 'Restock'),
#         ('adjustment', 'Adjustment'),
#     ]

#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     quantity = models.IntegerField()
#     transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
#     date = models.DateTimeField(auto_now_add=True)
#     note = models.TextField(blank=True, null=True)
#     user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f"{self.transaction_type} - {self.product.name} ({self.quantity})"

# class PurchaseOrder(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('received', 'Received'),
#         ('cancelled', 'Cancelled'),
#     ]

#     supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
#     order_date = models.DateField()
#     total_cost = models.DecimalField(max_digits=10, decimal_places=2)
#     status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
#     user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f"PO-{self.id} - {self.supplier.name} ({self.status})"

# class StockAlert(models.Model):
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     threshold = models.IntegerField()
#     is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return f"Alert for {self.product.name} (Threshold: {self.threshold})"



from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    staff_id = models.CharField(max_length=255, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)  # Added date_created field

    def __str__(self):
        return self.name


class Product(models.Model):
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
    