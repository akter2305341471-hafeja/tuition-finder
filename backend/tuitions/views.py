from django.db import transaction
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole, IsGuardian, IsTutor

from .models import Application, TuitionPost
from .serializers import ApplicationSerializer, TuitionPostSerializer


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def filter_posts(qs, params):
    """Search and filter by class, subject, area and salary range."""
    if params.get("q"):
        q = params["q"]
        qs = qs.filter(Q(title__icontains=q) | Q(subject__icontains=q)
                       | Q(area__icontains=q) | Q(description__icontains=q))
    for field in ("student_class", "subject", "area"):
        if params.get(field):
            qs = qs.filter(**{f"{field}__icontains": params[field]})
    if _int(params.get("min_salary")) is not None:
        qs = qs.filter(salary__gte=_int(params["min_salary"]))
    if _int(params.get("max_salary")) is not None:
        qs = qs.filter(salary__lte=_int(params["max_salary"]))
    return qs


class PostListCreateView(generics.ListCreateAPIView):
    """GET: public list of approved, open posts. POST: guardian creates a post."""
    serializer_class = TuitionPostSerializer

    def get_permissions(self):
        return [IsGuardian()] if self.request.method == "POST" else [AllowAny()]

    def get_queryset(self):
        qs = TuitionPost.objects.filter(approval="APPROVED", is_filled=False).select_related("guardian")
        return filter_posts(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(guardian=self.request.user)


class MyPostsView(generics.ListAPIView):
    permission_classes = [IsGuardian]
    serializer_class = TuitionPostSerializer

    def get_queryset(self):
        return TuitionPost.objects.filter(guardian=self.request.user).select_related("guardian")


class PostDetailView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsGuardian()]

    def get(self, request, pk):
        post = get_object_or_404(TuitionPost.objects.select_related("guardian"), pk=pk)
        user = request.user
        allowed = post.approval == "APPROVED" or (
            user.is_authenticated and (user.id == post.guardian_id or user.role == "ADMIN"))
        if not allowed:
            raise Http404
        return Response(TuitionPostSerializer(post, context={"request": request}).data)

    def put(self, request, pk):
        post = get_object_or_404(TuitionPost, pk=pk, guardian=request.user)
        serializer = TuitionPostSerializer(post, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        # an edited approved post goes back to the moderation queue
        extra = {"approval": "PENDING"} if post.approval == "APPROVED" else {}
        serializer.save(**extra)
        return Response(serializer.data)

    def delete(self, request, pk):
        get_object_or_404(TuitionPost, pk=pk, guardian=request.user).delete()
        return Response(status=204)


class ApplyView(APIView):
    permission_classes = [IsTutor]

    def post(self, request, pk):
        post = get_object_or_404(TuitionPost, pk=pk, approval="APPROVED")
        profile = getattr(request.user, "tutor_profile", None)
        if not profile or profile.verification != "APPROVED":
            return Response({"detail": "Only verified tutors can apply. Please wait for admin verification."}, status=403)
        if post.is_filled:
            return Response({"detail": "This tuition has already been filled."}, status=400)
        if Application.objects.filter(post=post, tutor=request.user).exists():
            return Response({"detail": "You have already applied to this post."}, status=400)
        application = Application.objects.create(post=post, tutor=request.user, message=request.data.get("message", ""))
        return Response(ApplicationSerializer(application).data, status=201)


class PostApplicationsView(APIView):
    permission_classes = [IsGuardian]

    def get(self, request, pk):
        post = get_object_or_404(TuitionPost, pk=pk, guardian=request.user)
        apps = post.applications.select_related("tutor", "post")
        return Response(ApplicationSerializer(apps, many=True).data)


class DecideView(APIView):
    """Guardian accepts or rejects an application."""
    permission_classes = [IsGuardian]

    def post(self, request, pk):
        application = get_object_or_404(Application.objects.select_related("post"), pk=pk, post__guardian=request.user)
        new_status = request.data.get("status")
        if new_status not in ("ACCEPTED", "REJECTED"):
            return Response({"detail": "status must be ACCEPTED or REJECTED."}, status=400)
        if application.status != "PENDING":
            return Response({"detail": "This application was already decided."}, status=400)
        if new_status == "ACCEPTED" and application.post.is_filled:
            return Response({"detail": "This tuition has already been filled."}, status=400)
        with transaction.atomic():
            application.status = new_status
            application.save(update_fields=["status"])
            if new_status == "ACCEPTED":
                post = application.post
                post.is_filled = True
                post.save(update_fields=["is_filled"])
                post.applications.filter(status="PENDING").exclude(pk=application.pk).update(status="REJECTED")
        return Response(ApplicationSerializer(application).data)


class MyApplicationsView(generics.ListAPIView):
    permission_classes = [IsTutor]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(tutor=self.request.user).select_related("post", "tutor")


# ---------- Admin: post moderation ----------
class AdminPostListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = TuitionPostSerializer

    def get_queryset(self):
        qs = TuitionPost.objects.select_related("guardian")
        approval = self.request.query_params.get("approval")
        return qs.filter(approval=approval) if approval else qs


class AdminModeratePostView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        post = get_object_or_404(TuitionPost, pk=pk)
        action = request.data.get("action")
        if action not in ("approve", "remove"):
            return Response({"detail": "action must be approve or remove."}, status=400)
        post.approval = "APPROVED" if action == "approve" else "REMOVED"
        post.save(update_fields=["approval"])
        return Response(TuitionPostSerializer(post, context={"request": request}).data)
