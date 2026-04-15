from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserRole


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'get_full_name', 'role', 'is_2fa_enabled', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_2fa_enabled', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name', 'registration_number']
    ordering = ['last_name', 'first_name']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'registration_number')}),
        ('Role & Status', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Two-Factor Auth', {'fields': ('is_2fa_enabled', 'totp_secret')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
            },
        ),
    )
