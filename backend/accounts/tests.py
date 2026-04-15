"""
Tests for the Authentication & Access module.
Covers: registration, login (email + reg-number), logout, profile,
        change-password, password-reset flow, and 2FA setup/disable.
"""

import pyotp
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

BASE_URL = '/api/auth'


def create_user(**kwargs):
    defaults = dict(
        email='test@example.com',
        first_name='Test',
        last_name='User',
        role='student',
        password='StrongP@ssw0rd!',
    )
    defaults.update(kwargs)
    password = defaults.pop('password')
    user = User.objects.create_user(**defaults)
    user.set_password(password)
    user.save()
    return user


class RegistrationTests(APITestCase):
    url = f'{BASE_URL}/register/'

    def _payload(self, **overrides):
        data = {
            'email': 'student@cvt.ac.ke',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': 'student',
            'registration_number': 'CVT/2024/001',
            'password': 'StrongP@ssw0rd!',
            'password_confirm': 'StrongP@ssw0rd!',
        }
        data.update(overrides)
        return data

    def test_successful_registration_returns_tokens(self):
        res = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)
        self.assertEqual(res.data['user']['role'], 'student')

    def test_password_mismatch_rejected(self):
        res = self.client.post(self.url, self._payload(password_confirm='wrong'), format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_rejected(self):
        self.client.post(self.url, self._payload(), format='json')
        res = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_email_rejected(self):
        payload = self._payload()
        del payload['email']
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_rejected(self):
        res = self.client.post(self.url, self._payload(password='123', password_confirm='123'), format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    url = f'{BASE_URL}/login/'

    def setUp(self):
        self.user = create_user(
            email='student@cvt.ac.ke',
            registration_number='CVT/2024/001',
            password='StrongP@ssw0rd!',
        )

    def test_login_with_email(self):
        res = self.client.post(
            self.url,
            {'identifier': 'student@cvt.ac.ke', 'password': 'StrongP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_login_with_registration_number(self):
        res = self.client.post(
            self.url,
            {'identifier': 'CVT/2024/001', 'password': 'StrongP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_wrong_password_rejected(self):
        res = self.client.post(
            self.url,
            {'identifier': 'student@cvt.ac.ke', 'password': 'WrongPassword!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_user_rejected(self):
        res = self.client.post(
            self.url,
            {'identifier': 'nobody@cvt.ac.ke', 'password': 'StrongP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inactive_user_rejected(self):
        self.user.is_active = False
        self.user.save()
        res = self.client.post(
            self.url,
            {'identifier': 'student@cvt.ac.ke', 'password': 'StrongP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_2fa_missing_otp_returns_error(self):
        secret = pyotp.random_base32()
        self.user.totp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()
        res = self.client.post(
            self.url,
            {'identifier': 'student@cvt.ac.ke', 'password': 'StrongP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_valid_2fa_otp(self):
        secret = pyotp.random_base32()
        self.user.totp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()
        otp = pyotp.TOTP(secret).now()
        res = self.client.post(
            self.url,
            {'identifier': 'student@cvt.ac.ke', 'password': 'StrongP@ssw0rd!', 'otp_code': otp},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class LogoutTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')

    def test_logout_blacklists_refresh_token(self):
        res = self.client.post(
            f'{BASE_URL}/logout/',
            {'refresh': str(self.refresh)},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_logout_without_token_returns_400(self):
        res = self.client.post(f'{BASE_URL}/logout/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_profile(self):
        res = self.client.get(f'{BASE_URL}/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], self.user.email)

    def test_update_profile(self):
        res = self.client.patch(f'{BASE_URL}/profile/', {'phone_number': '+254700000000'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['phone_number'], '+254700000000')

    def test_unauthenticated_access_denied(self):
        self.client.credentials()
        res = self.client.get(f'{BASE_URL}/profile/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.user = create_user(password='OldP@ssw0rd!')
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_change_password_success(self):
        res = self.client.post(
            f'{BASE_URL}/change-password/',
            {
                'old_password': 'OldP@ssw0rd!',
                'new_password': 'NewStr0ng#Pass!',
                'new_password_confirm': 'NewStr0ng#Pass!',
            },
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_wrong_old_password_rejected(self):
        res = self.client.post(
            f'{BASE_URL}/change-password/',
            {
                'old_password': 'WrongOldPassword!',
                'new_password': 'NewStr0ng#Pass!',
                'new_password_confirm': 'NewStr0ng#Pass!',
            },
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordResetTests(APITestCase):
    request_url = f'{BASE_URL}/password-reset/'
    confirm_url = f'{BASE_URL}/password-reset/confirm/'

    def setUp(self):
        self.user = create_user()

    def test_reset_request_returns_200_for_known_email(self):
        res = self.client.post(self.request_url, {'email': self.user.email}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_request_returns_200_for_unknown_email(self):
        # Should not leak whether the email exists
        res = self.client.post(self.request_url, {'email': 'nobody@example.com'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_confirm_reset_with_valid_token(self):
        import secrets as sec
        token = sec.token_urlsafe(32)
        self.user.password_reset_token = token
        self.user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=1)
        self.user.save()
        res = self.client.post(
            self.confirm_url,
            {'token': token, 'new_password': 'N3wP@ssw0rd!', 'new_password_confirm': 'N3wP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_confirm_reset_with_invalid_token(self):
        res = self.client.post(
            self.confirm_url,
            {'token': 'bogus-token', 'new_password': 'N3wP@ssw0rd!', 'new_password_confirm': 'N3wP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_reset_with_expired_token(self):
        import secrets as sec
        token = sec.token_urlsafe(32)
        self.user.password_reset_token = token
        self.user.password_reset_token_expires = timezone.now() - timezone.timedelta(hours=2)
        self.user.save()
        res = self.client.post(
            self.confirm_url,
            {'token': token, 'new_password': 'N3wP@ssw0rd!', 'new_password_confirm': 'N3wP@ssw0rd!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class TwoFactorAuthTests(APITestCase):
    setup_url = f'{BASE_URL}/2fa/setup/'
    disable_url = f'{BASE_URL}/2fa/disable/'

    def setUp(self):
        self.user = create_user(password='StrongP@ssw0rd!')
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_setup_returns_qr_and_secret(self):
        res = self.client.get(self.setup_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('secret', res.data)
        self.assertIn('qr_code', res.data)
        self.assertTrue(res.data['qr_code'].startswith('data:image/png;base64,'))

    def test_enable_2fa_with_valid_otp(self):
        self.client.get(self.setup_url)  # Generate secret
        self.user.refresh_from_db()
        otp = pyotp.TOTP(self.user.totp_secret).now()
        res = self.client.post(self.setup_url, {'otp_code': otp}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_2fa_enabled)

    def test_enable_2fa_with_invalid_otp(self):
        self.client.get(self.setup_url)
        res = self.client.post(self.setup_url, {'otp_code': '000000'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_disable_2fa(self):
        # Enable first
        secret = pyotp.random_base32()
        self.user.totp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()

        otp = pyotp.TOTP(secret).now()
        res = self.client.post(
            self.disable_url,
            {'password': 'StrongP@ssw0rd!', 'otp_code': otp},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_2fa_enabled)
