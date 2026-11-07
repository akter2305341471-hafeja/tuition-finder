from rest_framework.test import APITestCase

from accounts.models import User

PASSWORD = "Str0ng!Pass99"


class TuitionFinderTests(APITestCase):
    def register(self, username, role):
        res = self.client.post("/api/auth/register/", {
            "username": username, "email": f"{username}@t.com", "password": PASSWORD,
            "role": role, "first_name": username.title(), "phone": "01700000000"}, format="json")
        self.assertEqual(res.status_code, 201, res.data)

    def login(self, username):
        res = self.client.post("/api/auth/login/", {"username": username, "password": PASSWORD}, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + res.data["access"])

    def logout(self):
        self.client.credentials()

    def setUp(self):
        User.objects.create_superuser("boss", "boss@t.com", PASSWORD, role="ADMIN", first_name="Boss")
        self.register("guardian", "GUARDIAN")
        self.register("tutor", "TUTOR")

    def create_post(self, **extra):
        self.login("guardian")
        data = {"title": "Math for class 8", "student_class": "Class 8", "subject": "Math",
                "area": "Dhanmondi", "salary": 5000, "days_per_week": 3}
        data.update(extra)
        res = self.client.post("/api/posts/", data, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        return res.data["id"]

    def test_passwords_are_bcrypt_hashed(self):
        self.assertTrue(User.objects.get(username="tutor").password.startswith("bcrypt_sha256$"))

    def test_full_flow_post_apply_accept_review(self):
        post_id = self.create_post()
        self.assertEqual(self.client.get("/api/posts/").data, [])  # pending posts are hidden

        self.login("boss")
        self.client.post(f"/api/admin/posts/{post_id}/moderate/", {"action": "approve"}, format="json")
        self.assertEqual(len(self.client.get("/api/posts/").data), 1)

        self.login("tutor")  # tutor is not verified yet
        res = self.client.post(f"/api/posts/{post_id}/apply/", {"message": "Hi"}, format="json")
        self.assertEqual(res.status_code, 403)

        self.login("boss")
        tutor_profile = User.objects.get(username="tutor").tutor_profile
        self.client.post(f"/api/admin/tutors/{tutor_profile.id}/verify/", {"status": "APPROVED"}, format="json")

        self.login("tutor")
        self.assertEqual(self.client.post(f"/api/posts/{post_id}/apply/", {"message": "Hi"}, format="json").status_code, 201)
        dup = self.client.post(f"/api/posts/{post_id}/apply/", {"message": "Again"}, format="json")
        self.assertEqual(dup.status_code, 400)  # cannot apply twice

        self.login("guardian")
        apps = self.client.get(f"/api/posts/{post_id}/applications/").data
        self.assertEqual(len(apps), 1)
        self.assertNotIn("phone", apps[0]["tutor_info"])  # contact hidden until accepted
        res = self.client.post(f"/api/applications/{apps[0]['id']}/decide/", {"status": "ACCEPTED"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.client.get("/api/posts/").data, [])  # filled posts leave the list

        tutor_id = User.objects.get(username="tutor").id
        res = self.client.post("/api/reviews/", {"tutor": tutor_id, "rating": 5, "comment": "Great"}, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        res = self.client.post("/api/reviews/", {"tutor": tutor_id, "rating": 4}, format="json")
        self.assertEqual(res.status_code, 400)  # one review per tutor

        self.login("boss")
        stats = self.client.get("/api/admin/dashboard/").data
        self.assertEqual(stats["successful_matches"], 1)
        self.assertEqual(stats["total_posts"], 1)
        self.assertEqual(stats["total_users"], 2)

    def test_blocked_user_cannot_login(self):
        self.login("boss")
        guardian = User.objects.get(username="guardian")
        self.client.post(f"/api/admin/users/{guardian.id}/toggle-block/")
        self.logout()
        res = self.client.post("/api/auth/login/", {"username": "guardian", "password": PASSWORD}, format="json")
        self.assertEqual(res.status_code, 401)
        self.assertIn("blocked", str(res.data["detail"]).lower())

    def test_role_based_access(self):
        self.login("tutor")
        res = self.client.post("/api/posts/", {"title": "x"}, format="json")
        self.assertEqual(res.status_code, 403)  # tutors cannot post
        self.assertEqual(self.client.get("/api/admin/dashboard/").status_code, 403)
        self.logout()
        self.assertEqual(self.client.post("/api/posts/1/apply/").status_code, 401)  # not logged in

    def test_search_and_filter(self):
        self.create_post()
        self.create_post(title="Physics HSC", subject="Physics", area="Mirpur", salary=8000, student_class="HSC")
        self.login("boss")
        for post in self.client.get("/api/admin/posts/").data:
            self.client.post(f"/api/admin/posts/{post['id']}/moderate/", {"action": "approve"}, format="json")
        self.logout()
        self.assertEqual(len(self.client.get("/api/posts/").data), 2)
        self.assertEqual(len(self.client.get("/api/posts/?subject=physics").data), 1)
        self.assertEqual(len(self.client.get("/api/posts/?area=dhanmondi").data), 1)
        self.assertEqual(len(self.client.get("/api/posts/?min_salary=6000").data), 1)
        self.assertEqual(len(self.client.get("/api/posts/?max_salary=6000").data), 1)
        self.assertEqual(len(self.client.get("/api/posts/?min_salary=abc").data), 2)  # bad value is ignored
