import io
import secrets

import pyotp
import qrcode
import qrcode.image.svg
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email',
            'registration_number',
            'first_name',
            'last_name',
            'phone_number',
            'role',
            'password',
            'password_confirm',
        ]
        extra_kwargs = {
            'registration_number': {'required': False},
            'phone_number': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'registration_number',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'is_2fa_enabled',
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_2fa_enabled', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()


class LoginSerializer(serializers.Serializer):
    """
    Accepts either email address or registration number in the `identifier` field.
    """

    identifier = serializers.CharField(help_text='Email address or registration number.')
    password = serializers.CharField(write_only=True)
    otp_code = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='6-digit OTP from authenticator app (required only when 2FA is enabled).',
    )

    def validate(self, attrs):
        identifier = attrs.get('identifier', '').strip()
        password = attrs.get('password', '')
        otp_code = attrs.get('otp_code', '')

        # Resolve user by email or registration number
        user = None
        if '@' in identifier:
            user = authenticate(request=self.context.get('request'), username=identifier, password=password)
        else:
            try:
                candidate = User.objects.get(registration_number=identifier)
                user = authenticate(
                    request=self.context.get('request'),
                    username=candidate.email,
                    password=password,
                )
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError('Invalid credentials. Please check your identifier and password.')

        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated. Contact the administrator.')

        # 2FA verification
        if user.is_2fa_enabled:
            if not otp_code:
                raise serializers.ValidationError(
                    {'otp_required': True, 'detail': 'This account requires a 2FA code.'}
                )
            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(otp_code, valid_window=1):
                raise serializers.ValidationError({'otp_code': 'Invalid or expired 2FA code.'})

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return attrs


class Enable2FASerializer(serializers.Serializer):
    otp_code = serializers.CharField(help_text='Confirm setup with the first 6-digit code from your authenticator app.')


class Disable2FASerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    otp_code = serializers.CharField()


class TokenResponseSerializer(serializers.Serializer):
    """Helper serializer for documenting JWT token responses (not used for input)."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserProfileSerializer()
    otp_required = serializers.BooleanField(required=False)
