from django.db import models
from django.utils import timezone

class Profile(models.Model):
    username = models.CharField(max_length=225, unique=True, null=True)
    first_name = models.CharField(max_length=225, null=True)
    last_name = models.CharField(max_length=225, null=True)
    email = models.EmailField(max_length=225, unique=True, null=True)
    phone_number = models.CharField(max_length=225, null=True)
    user_type = models.CharField(max_length=225, unique=True, null=True)
    address = models.CharField(max_length=225, null=True)
    password = models.CharField(max_length=225)  # Store hashed password
    created_at = models.DateTimeField(default=timezone.now)  # Timestamp for creation
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp for last update

    def __str__(self):
        return f"{self.username} - {self.user_type}"
