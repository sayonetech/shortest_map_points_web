from django.urls import include, path

from applications.navigator import views

urlpatterns = [
    path('home/', views.NavigatorHome.as_view(), name='home'),
    path('map/', views.NavigatorView.as_view(), name='map'),
]
