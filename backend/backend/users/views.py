from django.http import JsonResponse
from django.views import View
from .models import Profile
from .serializers import ProfileSerializer  # Import your serializer
from django.contrib.auth.hashers import make_password, check_password
import json

class RegisterView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username') 
        password = data.get('password')
        user_type = data.get('user_type')
        email = data.get('email')
        phone_number = data.get('phoneNumber')
        address = data.get('address')
        first_name = data.get('firstName')
        last_name = data.get('lastName')

        # Check if username already exists
        if Profile.objects.filter(username=username).exists():
            return JsonResponse({'error': 'USERNAME_EXISTS', 'message': 'Username already exists'}, status=202)

        # Check if email already exists
        if Profile.objects.filter(email=email).exists():
            return JsonResponse({'error': 'EMAIL_EXISTS', 'message': 'Email already exists'}, status=203)

        # Check if user_type already exists
        if Profile.objects.filter(user_type=user_type).exists():
            return JsonResponse({'error': 'USER_TYPE_EXISTS', 'message': 'User type must be unique'}, status=204)


        # Hash the password and prepare profile data
        hashed_password = make_password(password)

        profile_data = {
            'user_type': user_type,
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone_number,
            'address': address,
            'password': hashed_password  # Store the hashed password
        }

        # Serialize and validate profile data
        serializer = ProfileSerializer(data=profile_data)
        if serializer.is_valid():
            serializer.save()  # Save the profile
            return JsonResponse({'message': 'User registered successfully'}, status=201)
        else:
            return JsonResponse({'error': serializer.errors}, status=400)




class LoginView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Check if email exists
        try:
            user_profile = Profile.objects.get(username=username)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'INVALID_USERNAME', 'message': 'Usernae does not exist. Please register.'}, status=203)

        # Check if the password is correct
        if check_password(password, user_profile.password):
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'INCORRECT_PASSWORD', 'message': 'Incorrect password'}, status=204)
        




class UserDetailView(View):
    def get(self, request, username):
        print("AT LEAST GOT IN HERE YOU KNOW IT NOW")
        try:
            profile = Profile.objects.get(username=username)  # Get user by username
            
            # Create a dictionary of all profile fields excluding 'password'
            user_data = {field.name: getattr(profile, field.name) for field in Profile._meta.fields if field.name != 'password'}
            
            return JsonResponse(user_data, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=406)
