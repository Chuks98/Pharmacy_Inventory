from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'  # Keep this to include all fields

        # This tells DRF that the 'id' field is not required
        extra_kwargs = {
            'id': {'required': False},  # Make 'id' not required
        }
