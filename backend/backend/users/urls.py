from django.urls import path
from .views import RegisterView, LoginView, UserDetailView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('register/', csrf_exempt(RegisterView.as_view()), name='register'),
    path('login/', csrf_exempt(LoginView.as_view()), name='login'),
    path('<str:username>/', csrf_exempt(UserDetailView.as_view()), name='user_detail'),
]
