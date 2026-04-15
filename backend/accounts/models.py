import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserRole(models.TextChoices):
    STUDENT = 'student', 'Student'
    LECTURER = 'lecturer', 'Lecturer'
    ADMIN = 'admin', 'Administrator'
    PARENT = 'parent', 'Parent/Guardian'
    EXAMINER = 'examiner', 'External Examiner'


class UserManager(BaseUserManager):
    """Custom manager that allows login via email OR registration number."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Central user model shared by all portal roles.
    Login: email address or registration_number (for students).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Core identity
    email = models.EmailField(unique=True)
    registration_number = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
        null=True,
        help_text='Student/Staff registration number (optional for parents/examiners).',
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True)

    # Role
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)

    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Two-factor authentication
    totp_secret = models.CharField(max_length=64, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)

    # Password reset
    password_reset_token = models.CharField(max_length=64, blank=True)
    password_reset_token_expires = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    objects = UserManager()

    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def get_short_name(self):
        return self.first_name
