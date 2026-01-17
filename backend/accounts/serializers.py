from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from accounts.models import Role

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'description',
            'dashboard_permission', 'pilgrims_permission', 
            'payments_permission', 'expenses_permission', 'treasury_permission',
            'is_active', 'created_at', 'updated_at', 'users_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'users_count']

    def get_users_count(self, obj):
        return obj.users.count()


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    custom_role_details = RoleSerializer(source='custom_role', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'avatar', 'role_type', 'custom_role', 'custom_role_details',
            'role_name', 'permissions', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'role_name', 'permissions']

    def get_role_name(self, obj):
        return obj.get_role_display()

    def get_permissions(self, obj):
        """Retourne les permissions de l'utilisateur pour chaque module"""
        if obj.role_type == 'admin':
            return {
                'dashboard': 'full',
                'pilgrims': 'full',
                'payments': 'full',
                'expenses': 'full',
                'treasury': 'full',
            }
        
        if obj.custom_role and obj.custom_role.is_active:
            return {
                'dashboard': obj.custom_role.dashboard_permission,
                'pilgrims': obj.custom_role.pilgrims_permission,
                'payments': obj.custom_role.payments_permission,
                'expenses': obj.custom_role.expenses_permission,
                'treasury': obj.custom_role.treasury_permission,
            }
        
        return {
            'dashboard': 'none',
            'pilgrims': 'none',
            'payments': 'none',
            'expenses': 'none',
            'treasury': 'none',
        }


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'phone', 'password', 'password_confirm', 
            'role_type', 'custom_role'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        
        if data.get('role_type') == 'custom' and not data.get('custom_role'):
            raise serializers.ValidationError({"custom_role": "Un rôle personnalisé est requis."})
        
        if data.get('role_type') == 'admin' and data.get('custom_role'):
            raise serializers.ValidationError({"custom_role": "Les administrateurs n'ont pas besoin de rôle personnalisé."})
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 
            'phone', 'avatar', 'password',
            'role_type', 'custom_role', 'is_active'
        ]

    def validate(self, data):
        if data.get('role_type') == 'custom' and not data.get('custom_role'):
            if not self.instance.custom_role:
                raise serializers.ValidationError({"custom_role": "Un rôle personnalisé est requis."})
        
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role_type'] = user.role_type
        token['role_name'] = user.get_role_display()
        
        # Ajouter les permissions au token
        if user.role_type == 'admin':
            token['permissions'] = {
                'dashboard': 'full',
                'pilgrims': 'full',
                'payments': 'full',
                'expenses': 'full',
                'treasury': 'full',
            }
        elif user.custom_role and user.custom_role.is_active:
            token['permissions'] = {
                'dashboard': user.custom_role.dashboard_permission,
                'pilgrims': user.custom_role.pilgrims_permission,
                'payments': user.custom_role.payments_permission,
                'expenses': user.custom_role.expenses_permission,
                'treasury': user.custom_role.treasury_permission,
            }
        else:
            token['permissions'] = {}
        
        return token
