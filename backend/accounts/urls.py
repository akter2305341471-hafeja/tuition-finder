from django.urls import path

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/me/", views.MeView.as_view()),
    path("profile/", views.ProfileView.as_view()),
    path("tutors/", views.TutorListView.as_view()),
    path("tutors/<int:pk>/", views.TutorDetailView.as_view()),
    path("admin/users/", views.AdminUserListView.as_view()),
    path("admin/users/<int:pk>/toggle-block/", views.AdminToggleBlockView.as_view()),
    path("admin/tutors/", views.AdminTutorListView.as_view()),
    path("admin/tutors/<int:pk>/verify/", views.AdminTutorVerifyView.as_view()),
]
