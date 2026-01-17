from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import UserViewSet, RoleViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
