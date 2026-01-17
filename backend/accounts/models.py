from django.contrib.auth.models import AbstractUser
from django.db import models
from enum import Enum


class PermissionModule(str, Enum):
    DASHBOARD = "dashboard"
    PILGRIMS = "pilgrims"
    PAYMENTS = "payments"
    EXPENSES = "expenses"
    TREASURY = "treasury"


class PermissionLevel(str, Enum):
    NONE = "none"
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    FULL = "full"


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Permissions par module
    dashboard_permission = models.CharField(
        max_length=20,
        choices=[(p.value, p.value) for p in PermissionLevel],
        default=PermissionLevel.VIEW.value
    )
    pilgrims_permission = models.CharField(
        max_length=20,
        choices=[(p.value, p.value) for p in PermissionLevel],
        default=PermissionLevel.NONE.value
    )
    payments_permission = models.CharField(
        max_length=20,
        choices=[(p.value, p.value) for p in PermissionLevel],
        default=PermissionLevel.NONE.value
    )
    expenses_permission = models.CharField(
        max_length=20,
        choices=[(p.value, p.value) for p in PermissionLevel],
        default=PermissionLevel.NONE.value
    )
    treasury_permission = models.CharField(
        max_length=20,
        choices=[(p.value, p.value) for p in PermissionLevel],
        default=PermissionLevel.NONE.value
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_role'
        ordering = ['name']

    def __str__(self):
        return self.name

    def has_permission(self, module: str, level: str) -> bool:
        """Vérifie si le rôle a une permission spécifique"""
        permission_field = f"{module}_permission"
        if not hasattr(self, permission_field):
            return False
        
        current_level = getattr(self, permission_field)
        
        if current_level == PermissionLevel.FULL.value:
            return True
        if current_level == PermissionLevel.NONE.value:
            return False
        
        # Hiérarchie des permissions
        hierarchy = {
            PermissionLevel.VIEW.value: [PermissionLevel.VIEW.value],
            PermissionLevel.CREATE.value: [PermissionLevel.VIEW.value, PermissionLevel.CREATE.value],
            PermissionLevel.EDIT.value: [PermissionLevel.VIEW.value, PermissionLevel.CREATE.value, PermissionLevel.EDIT.value],
            PermissionLevel.DELETE.value: [PermissionLevel.VIEW.value, PermissionLevel.CREATE.value, PermissionLevel.EDIT.value, PermissionLevel.DELETE.value],
        }
        
        return level in hierarchy.get(current_level, [])


class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOM = "custom"


class User(AbstractUser):
    ROLE_CHOICES = [
        (UserRole.ADMIN.value, "Administrator"),
        (UserRole.CUSTOM.value, "Custom Role"),
    ]

    role_type = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=UserRole.CUSTOM.value,
        help_text="Type de rôle de l'utilisateur"
    )
    custom_role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text="Rôle personnalisé si role_type=custom"
    )
    
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_user'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def get_role_display(self):
        if self.role_type == UserRole.ADMIN.value:
            return "Administrateur"
        elif self.custom_role:
            return self.custom_role.name
        return "Sans rôle"

    def has_module_permission(self, module: str, level: str = 'view') -> bool:
        """Vérifie si l'utilisateur a une permission sur un module"""
        if self.role_type == UserRole.ADMIN.value:
            return True
        
        if self.custom_role and self.custom_role.is_active:
            return self.custom_role.has_permission(module, level)
        
        return False
