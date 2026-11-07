from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import GuardianProfile, TutorProfile, User
from .permissions import IsAdminRole
from .serializers import (GuardianProfileSerializer, LoginSerializer, RegisterSerializer,
                          TutorDetailSerializer, TutorProfileSerializer, UserSerializer)


# ---------- Module 1: register / login / profiles ----------
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileView(APIView):
    """Tutor or guardian reads / edits their own profile."""

    def _profile(self, user):
        if user.role == "TUTOR":
            return TutorProfile.objects.get_or_create(user=user)[0], TutorProfileSerializer
        if user.role == "GUARDIAN":
            return GuardianProfile.objects.get_or_create(user=user)[0], GuardianProfileSerializer
        return None, None

    def get(self, request):
        profile, serializer_class = self._profile(request.user)
        if profile is None:
            return Response(UserSerializer(request.user).data)
        return Response(serializer_class(profile).data)

    def put(self, request):
        profile, serializer_class = self._profile(request.user)
        if profile is None:
            return Response({"detail": "Admins have no profile."}, status=400)
        serializer = serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = request.user
        user.first_name = request.data.get("name", user.first_name)
        user.phone = request.data.get("phone", user.phone)
        user.save(update_fields=["first_name", "phone"])
        # a rejected tutor who updates the profile goes back to the review queue
        if user.role == "TUTOR" and profile.verification == "REJECTED":
            profile.verification = "PENDING"
            profile.save(update_fields=["verification"])
        profile.refresh_from_db()
        return Response(serializer_class(profile).data)


# ---------- Public tutor directory ----------
class TutorListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TutorProfileSerializer

    def get_queryset(self):
        qs = TutorProfile.objects.filter(verification="APPROVED").select_related("user")
        p = self.request.query_params
        if p.get("subject"):
            qs = qs.filter(subjects__icontains=p["subject"])
        if p.get("area"):
            qs = qs.filter(area__icontains=p["area"])
        return qs


class TutorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = TutorDetailSerializer
    queryset = TutorProfile.objects.filter(verification="APPROVED").select_related("user")


# ---------- Admin: verify tutors, manage users ----------
class AdminTutorListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = TutorProfileSerializer

    def get_queryset(self):
        qs = TutorProfile.objects.select_related("user").order_by("id")
        v = self.request.query_params.get("verification")
        return qs.filter(verification=v) if v else qs


class AdminTutorVerifyView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        profile = get_object_or_404(TutorProfile, pk=pk)
        new_status = request.data.get("status")
        if new_status not in ("APPROVED", "REJECTED"):
            return Response({"detail": "status must be APPROVED or REJECTED."}, status=400)
        profile.verification = new_status
        profile.save(update_fields=["verification"])
        return Response(TutorProfileSerializer(profile).data)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = User.objects.exclude(role="ADMIN").order_by("id")
        p = self.request.query_params
        if p.get("role"):
            qs = qs.filter(role=p["role"])
        if p.get("q"):
            qs = qs.filter(Q(username__icontains=p["q"]) | Q(first_name__icontains=p["q"]) | Q(email__icontains=p["q"]))
        return qs


class AdminToggleBlockView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk, role__in=["GUARDIAN", "TUTOR"])
        user.is_active = not user.is_active  # blocked user => is_active False => cannot log in
        user.save(update_fields=["is_active"])
        return Response(UserSerializer(user).data)
