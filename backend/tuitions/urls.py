from django.urls import path

from . import views

urlpatterns = [
    path("posts/", views.PostListCreateView.as_view()),
    path("posts/mine/", views.MyPostsView.as_view()),
    path("posts/<int:pk>/", views.PostDetailView.as_view()),
    path("posts/<int:pk>/apply/", views.ApplyView.as_view()),
    path("posts/<int:pk>/applications/", views.PostApplicationsView.as_view()),
    path("applications/mine/", views.MyApplicationsView.as_view()),
    path("applications/<int:pk>/decide/", views.DecideView.as_view()),
    path("admin/posts/", views.AdminPostListView.as_view()),
    path("admin/posts/<int:pk>/moderate/", views.AdminModeratePostView.as_view()),
]
