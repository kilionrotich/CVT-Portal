from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Registration & login
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='auth-profile'),

    # Password management
    path('change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='auth-password-reset-request'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),

    # 2FA
    path('2fa/setup/', views.Setup2FAView.as_view(), name='auth-2fa-setup'),
    path('2fa/disable/', views.Disable2FAView.as_view(), name='auth-2fa-disable'),
]
