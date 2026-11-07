from django.contrib.auth.password_validation import validate_password
from django.db.models import Avg, Count
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import GuardianProfile, TutorProfile, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "role", "phone", "is_active"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["GUARDIAN", "TUTOR"])

    class Meta:
        model = User
        fields = ["username", "email", "password", "role", "phone", "first_name"]
        extra_kwargs = {"first_name": {"required": True, "allow_blank": False}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # bcrypt hash
        user.save()
        profile_model = TutorProfile if user.role == "TUTOR" else GuardianProfile
        profile_model.objects.create(user=user)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        user = User.objects.filter(username=attrs.get("username")).first()
        if user and not user.is_active and user.check_password(attrs.get("password", "")):
            raise AuthenticationFailed("Your account has been blocked. Please contact the admin.")
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class TutorProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.CharField(source="user.first_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = TutorProfile
        fields = ["id", "user_id", "name", "phone", "education", "experience", "subjects", "area",
                  "expected_salary", "bio", "verification", "rating", "review_count"]
        read_only_fields = ["verification"]

    def _agg(self, obj):
        return obj.user.reviews_received.aggregate(avg=Avg("rating"), n=Count("id"))

    def get_rating(self, obj):
        avg = self._agg(obj)["avg"]
        return round(avg, 1) if avg else None

    def get_review_count(self, obj):
        return self._agg(obj)["n"]


class TutorDetailSerializer(TutorProfileSerializer):
    reviews = serializers.SerializerMethodField()

    class Meta(TutorProfileSerializer.Meta):
        fields = TutorProfileSerializer.Meta.fields + ["reviews"]

    def get_reviews(self, obj):
        from reviews.serializers import ReviewSerializer
        qs = obj.user.reviews_received.select_related("guardian").order_by("-created_at")
        return ReviewSerializer(qs, many=True).data


class GuardianProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.first_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = GuardianProfile
        fields = ["id", "name", "phone", "address", "area"]
