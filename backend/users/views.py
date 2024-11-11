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



# Login Code
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





# Get all users
class GetAllUsersView(View):
    def get(self, request):
        try:
            # Query all Profile records
            users = Profile.objects.all()
            
            # Serialize the queryset
            serializer = ProfileSerializer(users, many=True)

            print('YBFKYHSIFBUHDSBIUYFDGSUDSIUDHIUSHDIUHN')
            
            # Return JSON response
            return JsonResponse(serializer.data, safe=False, status=200)

        except Profile.DoesNotExist:
            return JsonResponse({'error': 'NO_USERS_FOUND', 'message': 'No users found in the database'}, status=404)
        
        except Exception as e:
            # Catch any other unexpected errors
            return JsonResponse({'error': 'INTERNAL_SERVER_ERROR', 'message': str(e)}, status=500)



# Get specific user via username
class GetSingleUserView(View):
    def get(self, request, username):
        try:
            profile = Profile.objects.get(username=username)  # Get user by username
            
            # Create a dictionary of all profile fields excluding 'password'
            user_data = {field.name: getattr(profile, field.name) for field in Profile._meta.fields if field.name != 'password'}
            
            return JsonResponse(user_data, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=406)
        


# Update a specific user via id
class UpdateSingleUserView(View):
    def patch(self, request, user_id):
        try:
            # Find the user record
            user = Profile.objects.get(id=user_id)

            # Parse JSON data from request body
            data = json.loads(request.body)

            # Check for username uniqueness
            if "username" in data:
                username = data["username"]
                if Profile.objects.filter(username=username).exclude(id=user_id).exists():
                    return JsonResponse({'error': 'USERNAME_ALREADY_EXISTS', 'message': 'Username already exists'}, status=203)

            # Check for email uniqueness
            if "email" in data:
                email = data["email"]
                if Profile.objects.filter(email=email).exclude(id=user_id).exists():
                    return JsonResponse({'error': 'EMAIL_ALREADY_EXISTS', 'message': 'Email already exists'}, status=204)

            # Check for user_type uniqueness
            if "user_type" in data:
                user_type = data["user_type"]
                if Profile.objects.filter(user_type=user_type).exclude(id=user_id).exists():
                    return JsonResponse({'error': 'USER_TYPE_ALREADY_EXISTS', 'message': 'User type already exists'}, status=205)

            # Update the user fields if provided in the request data
            user.username = data.get("username", user.username)
            user.user_type = data.get("user_type", user.user_type)
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.email = data.get("email", user.email)
            user.phone_number = data.get("phone_number", user.phone_number)
            user.address = data.get("address", user.address)

            # Hash and update the password if it's provided
            if "password" in data:
                user.password = make_password(data["password"])

            # Save changes to the database
            user.save()

            # Serialize the updated user data and send a response
            serializer = ProfileSerializer(user)
            return JsonResponse(serializer.data, status=200)

        except Profile.DoesNotExist:
            return JsonResponse({'error': 'USER_NOT_FOUND', 'message': 'User not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': 'INTERNAL_SERVER_ERROR', 'message': str(e)}, status=500)



# Delete a specific user using user id
class DeleteSingleUserView(View):
    def delete(self, request, user_id):
        try:
            # Try to retrieve the user by their ID
            user = Profile.objects.get(id=user_id)
            user.delete()  # Delete the user
            return JsonResponse({'message': 'User deleted successfully'}, status=200)
        except Profile.DoesNotExist:
            # If user with the given ID does not exist
            return JsonResponse({'error': 'USER_NOT_FOUND', 'message': 'User not found'}, status=404)