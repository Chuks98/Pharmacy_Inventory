from django.urls import path
from .views import RegisterView, LoginView, GetAllUsersView, GetSingleUserView, UpdateSingleUserView, DeleteSingleUserView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('register/', csrf_exempt(RegisterView.as_view()), name='register'),
    path('login/', csrf_exempt(LoginView.as_view()), name='login'),
    path('get_all_users/', csrf_exempt(GetAllUsersView.as_view()), name='get_all_users'),
    path('get_single_user/<str:username>/', csrf_exempt(GetSingleUserView.as_view()), name='get_single_user'),
    path('update_single_user/<int:user_id>/', csrf_exempt(UpdateSingleUserView.as_view()), name='update_single_user'),
    path('delete_single_user/<int:user_id>/', csrf_exempt(DeleteSingleUserView.as_view()), name='delete_single_user'),
]
