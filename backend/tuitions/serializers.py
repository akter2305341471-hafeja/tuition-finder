from django.db.models import Avg
from rest_framework import serializers

from .models import Application, TuitionPost


class TuitionPostSerializer(serializers.ModelSerializer):
    guardian_name = serializers.CharField(source="guardian.first_name", read_only=True)
    applications_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = TuitionPost
        fields = ["id", "title", "student_class", "subject", "area", "salary", "days_per_week",
                  "description", "approval", "is_filled", "created_at", "guardian_name",
                  "applications_count", "has_applied"]
        read_only_fields = ["approval", "is_filled", "created_at"]

    def validate_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Salary must be greater than 0.")
        return value

    def validate_days_per_week(self, value):
        if not 1 <= value <= 7:
            raise serializers.ValidationError("Days per week must be between 1 and 7.")
        return value

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.role == "TUTOR"
                    and obj.applications.filter(tutor=user).exists())


class ApplicationSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_area = serializers.CharField(source="post.area", read_only=True)
    post_salary = serializers.IntegerField(source="post.salary", read_only=True)
    tutor_name = serializers.CharField(source="tutor.first_name", read_only=True)
    tutor_info = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ["id", "post", "post_title", "post_area", "post_salary", "tutor_name",
                  "tutor_info", "message", "status", "created_at"]
        read_only_fields = fields

    def get_tutor_info(self, obj):
        profile = getattr(obj.tutor, "tutor_profile", None)
        if not profile:
            return None
        rating = obj.tutor.reviews_received.aggregate(avg=Avg("rating"))["avg"]
        info = {
            "profile_id": profile.id,
            "education": profile.education,
            "experience": profile.experience,
            "subjects": profile.subjects,
            "expected_salary": profile.expected_salary,
            "rating": round(rating, 1) if rating else None,
        }
        if obj.status == "ACCEPTED":  # contact details are shared only after hiring
            info["phone"] = obj.tutor.phone
        return info
