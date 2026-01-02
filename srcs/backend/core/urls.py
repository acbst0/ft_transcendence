from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CircleViewSet, TaskViewSet, RegisterView, LoginView

router = DefaultRouter()
router.register(r'circles', CircleViewSet)
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
]
