from django.urls import path

from . import views

urlpatterns = [
    path("reviews/", views.ReviewCreateView.as_view()),
    path("reviews/hired/", views.HiredTutorsView.as_view()),
    path("admin/dashboard/", views.DashboardView.as_view()),
]
