from django.conf import settings
from django.db import models


class TuitionPost(models.Model):
    class Approval(models.TextChoices):
        PENDING = "PENDING"
        APPROVED = "APPROVED"
        REMOVED = "REMOVED"

    guardian = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=150)
    student_class = models.CharField(max_length=50)
    subject = models.CharField(max_length=100)
    area = models.CharField(max_length=100)
    salary = models.PositiveIntegerField(help_text="Monthly salary in BDT")
    days_per_week = models.PositiveSmallIntegerField(default=3)
    description = models.TextField(blank=True)
    approval = models.CharField(max_length=10, choices=Approval.choices, default=Approval.PENDING)
    is_filled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        ACCEPTED = "ACCEPTED"
        REJECTED = "REJECTED"

    post = models.ForeignKey(TuitionPost, on_delete=models.CASCADE, related_name="applications")
    tutor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["post", "tutor"], name="one_application_per_tutor_per_post")]

    def __str__(self):
        return f"{self.tutor} -> {self.post}"
