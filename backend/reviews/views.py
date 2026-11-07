from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import TutorProfile
from accounts.permissions import IsAdminRole, IsGuardian
from tuitions.models import Application, TuitionPost

from .models import Review
from .serializers import ReviewSerializer

User = get_user_model()


class ReviewCreateView(generics.CreateAPIView):
    permission_classes = [IsGuardian]
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(guardian=self.request.user)


class HiredTutorsView(APIView):
    """Tutors a guardian has hired, and whether they were already reviewed."""
    permission_classes = [IsGuardian]

    def get(self, request):
        apps = Application.objects.filter(post__guardian=request.user, status="ACCEPTED").select_related("tutor", "post")
        reviewed = set(Review.objects.filter(guardian=request.user).values_list("tutor_id", flat=True))
        return Response([{
            "tutor_id": a.tutor_id,
            "tutor_name": a.tutor.first_name,
            "phone": a.tutor.phone,
            "post_title": a.post.title,
            "reviewed": a.tutor_id in reviewed,
        } for a in apps])


class DashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        return Response({
            "total_users": User.objects.exclude(role="ADMIN").count(),
            "guardians": User.objects.filter(role="GUARDIAN").count(),
            "tutors": User.objects.filter(role="TUTOR").count(),
            "pending_tutors": TutorProfile.objects.filter(verification="PENDING").count(),
            "total_posts": TuitionPost.objects.count(),
            "pending_posts": TuitionPost.objects.filter(approval="PENDING").count(),
            "successful_matches": Application.objects.filter(status="ACCEPTED").count(),
            "total_reviews": Review.objects.count(),
        })
