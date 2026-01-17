from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from accounts.models import Role
from accounts.serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    RoleSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RoleViewSet(viewsets.ModelViewSet):
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Seuls les admins peuvent voir tous les rôles
        if self.request.user.role_type == 'admin':
            return Role.objects.all()
        # Les autres ne voient que les rôles actifs
        return Role.objects.filter(is_active=True)

    def create(self, request, *args, **kwargs):
        # Seuls les admins peuvent créer des rôles
        if request.user.role_type != 'admin':
            return Response(
                {"detail": "Seuls les administrateurs peuvent créer des rôles"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Seuls les admins peuvent modifier des rôles
        if request.user.role_type != 'admin':
            return Response(
                {"detail": "Seuls les administrateurs peuvent modifier des rôles"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Seuls les admins peuvent supprimer des rôles
        if request.user.role_type != 'admin':
            return Response(
                {"detail": "Seuls les administrateurs peuvent supprimer des rôles"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        role = self.get_object()
        # Vérifier si le rôle est utilisé
        if role.users.exists():
            return Response(
                {"detail": f"Ce rôle est utilisé par {role.users.count()} utilisateur(s). Désactivez-le au lieu de le supprimer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def permission_levels(self, request):
        """Liste les niveaux de permission disponibles"""
        from accounts.models import PermissionLevel
        return Response({
            'levels': [
                {'value': p.value, 'label': p.value.capitalize()}
                for p in PermissionLevel
            ]
        })

    @action(detail=False, methods=['get'])
    def modules(self, request):
        """Liste les modules disponibles"""
        from accounts.models import PermissionModule
        return Response({
            'modules': [
                {'value': m.value, 'label': m.value.capitalize()}
                for m in PermissionModule
            ]
        })


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'register':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Seuls les admins peuvent voir tous les utilisateurs
        if self.request.user.role_type == 'admin':
            return User.objects.all()
        # Les autres ne voient que leur profil
        return User.objects.filter(id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        # Seuls les admins peuvent créer des utilisateurs
        if request.user.role_type != 'admin':
            return Response(
                {"detail": "Seuls les administrateurs peuvent créer des utilisateurs"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Les users peuvent modifier leur profil, les admins peuvent tout modifier
        if request.user.role_type != 'admin' and instance.id != request.user.id:
            return Response(
                {"detail": "Vous ne pouvez modifier que votre propre profil"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Les non-admins ne peuvent pas changer leur rôle
        if request.user.role_type != 'admin' and 'role_type' in request.data:
            return Response(
                {"detail": "Vous ne pouvez pas modifier votre rôle"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Seuls les admins peuvent supprimer des utilisateurs
        if request.user.role_type != 'admin':
            return Response(
                {"detail": "Seuls les administrateurs peuvent supprimer des utilisateurs"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        
        # Empêcher la suppression de son propre compte
        if instance.id == request.user.id:
            return Response(
                {"detail": "Vous ne pouvez pas supprimer votre propre compte"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def register(self, request):
        """Inscription publique (optionnel - peut être désactivé)"""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Utilisateur enregistré avec succès",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated()])
    def me(self, request):
        """Profil de l'utilisateur connecté"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated()])
    def update_profile(self, request):
        """Mise à jour du profil de l'utilisateur connecté"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        
        # Empêcher la modification du rôle
        if 'role_type' in request.data or 'custom_role' in request.data:
            if request.user.role_type != 'admin':
                return Response(
                    {"detail": "Vous ne pouvez pas modifier votre rôle"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        user = serializer.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['get'])
    def permissions(self, request):
        """Permissions de l'utilisateur connecté"""
        user = request.user
        
        if user.role_type == 'admin':
            permissions = {
                'dashboard': 'full',
                'pilgrims': 'full',
                'payments': 'full',
                'expenses': 'full',
                'treasury': 'full',
            }
        elif user.custom_role and user.custom_role.is_active:
            permissions = {
                'dashboard': user.custom_role.dashboard_permission,
                'pilgrims': user.custom_role.pilgrims_permission,
                'payments': user.custom_role.payments_permission,
                'expenses': user.custom_role.expenses_permission,
                'treasury': user.custom_role.treasury_permission,
            }
        else:
            permissions = {
                'dashboard': 'none',
                'pilgrims': 'none',
                'payments': 'none',
                'expenses': 'none',
                'treasury': 'none',
            }
        
        return Response(permissions)
