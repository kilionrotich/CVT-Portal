import base64
import io
import secrets

import pyotp
import qrcode
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    Disable2FASerializer,
    Enable2FASerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)

User = get_user_model()


def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new account."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                **tokens,
                'user': UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ — authenticate with email/reg-number + password (+ optional OTP)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                **tokens,
                'user': UserProfileSerializer(user).data,
            }
        )


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({'detail': 'Invalid or already-expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — view and update own profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — change password while logged in."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password changed successfully.'})


class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/ — send a reset link to the user's email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = secrets.token_urlsafe(32)
            user.password_reset_token = token
            user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=1)
            user.save()
            reset_url = f"{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'}/reset-password/{token}"
            send_mail(
                subject='CVT Portal – Password Reset Request',
                message=(
                    f'Hello {user.get_full_name()},\n\n'
                    f'Click the link below to reset your password (valid for 1 hour):\n\n'
                    f'{reset_url}\n\n'
                    f'If you did not request this, please ignore this email.\n\n'
                    f'– CVT Portal Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            pass
        # Always return 200 to avoid user enumeration
        return Response({'detail': 'If that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset/confirm/ — set a new password using the reset token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(password_reset_token=token)
        except User.DoesNotExist:
            return Response({'token': 'Invalid reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.password_reset_token_expires < timezone.now():
            return Response({'token': 'Reset token has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.password_reset_token = ''
        user.password_reset_token_expires = None
        user.save()
        return Response({'detail': 'Password has been reset successfully. You can now log in.'})


class Setup2FAView(APIView):
    """
    GET  /api/auth/2fa/setup/ — generate a new TOTP secret and return a QR-code data URL.
    POST /api/auth/2fa/setup/ — confirm setup with the first OTP code, then enable 2FA.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Generate a fresh secret each time GET is called
        secret = pyotp.random_base32()
        user.totp_secret = secret
        user.save()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name=getattr(settings, 'OTP_TOTP_ISSUER', 'CVT Portal'),
        )
        # Build QR code as base64-encoded PNG
        img = qrcode.make(provisioning_uri)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        qr_b64 = base64.b64encode(buf.getvalue()).decode()
        return Response(
            {
                'secret': secret,
                'qr_code': f'data:image/png;base64,{qr_b64}',
                'provisioning_uri': provisioning_uri,
            }
        )

    def post(self, request, *args, **kwargs):
        serializer = Enable2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.totp_secret:
            return Response({'detail': 'Call GET first to generate a secret.'}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(serializer.validated_data['otp_code'], valid_window=1):
            return Response({'otp_code': 'Invalid OTP code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_2fa_enabled = True
        user.save()
        return Response({'detail': '2FA has been enabled on your account.'})


class Disable2FAView(APIView):
    """POST /api/auth/2fa/disable/ — disable 2FA (requires current password + OTP)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = Disable2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['password']):
            return Response({'password': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(serializer.validated_data['otp_code'], valid_window=1):
            return Response({'otp_code': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_2fa_enabled = False
        user.totp_secret = ''
        user.save()
        return Response({'detail': '2FA has been disabled on your account.'})
