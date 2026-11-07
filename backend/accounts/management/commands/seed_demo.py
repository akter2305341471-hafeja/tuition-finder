from django.core.management.base import BaseCommand

from accounts.models import GuardianProfile, TutorProfile, User
from tuitions.models import TuitionPost


class Command(BaseCommand):
    help = "Create demo users and tuition posts (safe to run more than once)."

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin12345",
                                          role="ADMIN", first_name="Site Admin")

        def make(username, name, role, phone):
            user, created = User.objects.get_or_create(username=username, defaults={
                "first_name": name, "email": f"{username}@example.com", "role": role, "phone": phone})
            if created:
                user.set_password("password123")
                user.save()
            return user

        tutors = [
            ("tutor1", "Rahim Uddin", "01711000001", "BSc in CSE, SEU", "3 years", "Math, Physics, ICT", "Dhanmondi", 6000, "APPROVED"),
            ("tutor2", "Nusrat Jahan", "01711000002", "BBA, Dhaka University", "2 years", "English, Accounting", "Mirpur", 5000, "APPROVED"),
            ("tutor3", "Sakib Hasan", "01711000003", "BSc in EEE, BUET", "1 year", "Physics, Chemistry", "Uttara", 7000, "PENDING"),
        ]
        for username, name, phone, edu, exp, subjects, area, salary, verification in tutors:
            user = make(username, name, "TUTOR", phone)
            TutorProfile.objects.update_or_create(user=user, defaults=dict(
                education=edu, experience=exp, subjects=subjects, area=area, expected_salary=salary,
                bio=f"{name} teaches {subjects}.", verification=verification))

        guardians = [("guardian1", "Mrs. Farida Begum", "01811000001", "Dhanmondi"),
                     ("guardian2", "Mr. Kamal Hossain", "01811000002", "Mirpur")]
        owners = []
        for username, name, phone, area in guardians:
            user = make(username, name, "GUARDIAN", phone)
            GuardianProfile.objects.update_or_create(user=user, defaults={"address": f"House 10, {area}", "area": area})
            owners.append(user)

        if not TuitionPost.objects.exists():
            posts = [
                (0, "Math tutor for Class 8", "Class 8", "Math", "Dhanmondi", 5000, 3, "APPROVED"),
                (0, "Physics tutor for HSC", "HSC 1st year", "Physics", "Dhanmondi", 7000, 4, "APPROVED"),
                (1, "English tutor for Class 5", "Class 5", "English", "Mirpur", 4000, 3, "APPROVED"),
                (1, "Chemistry tutor for SSC", "SSC", "Chemistry", "Mirpur", 6000, 3, "APPROVED"),
                (1, "ICT tutor for Class 9", "Class 9", "ICT", "Uttara", 4500, 2, "PENDING"),
            ]
            for idx, title, cls, subject, area, salary, days, approval in posts:
                TuitionPost.objects.create(guardian=owners[idx], title=title, student_class=cls, subject=subject,
                                           area=area, salary=salary, days_per_week=days, approval=approval,
                                           description=f"Need an experienced {subject} tutor at home.")
        self.stdout.write(self.style.SUCCESS("Demo data ready. Logins: admin/admin12345, others password123"))
