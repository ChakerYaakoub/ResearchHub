"""Tests for shared input validation helpers."""

from django.test import SimpleTestCase
from rest_framework.exceptions import ValidationError

from core.validation import (
    sanitize_plain_text,
    username_from_email_local,
    validate_code,
    validate_person_name,
    validate_title,
    validate_username,
)


class ValidationHelpersTests(SimpleTestCase):
    def test_sanitize_rejects_html_tags(self):
        with self.assertRaises(ValidationError):
            sanitize_plain_text('<script>alert(1)</script>')
        with self.assertRaises(ValidationError):
            sanitize_plain_text('Hello <b>world</b>')

    def test_sanitize_allows_scientific_less_than(self):
        self.assertEqual(sanitize_plain_text("T < 300 K"), "T < 300 K")

    def test_sanitize_collapses_single_line_whitespace(self):
        self.assertEqual(sanitize_plain_text("  a   b  "), "a b")

    def test_username_charset_and_length(self):
        self.assertEqual(validate_username("alice_1"), "alice_1")
        with self.assertRaises(ValidationError):
            validate_username("ab")
        with self.assertRaises(ValidationError):
            validate_username("bad name")
        with self.assertRaises(ValidationError):
            validate_username("bad@name")

    def test_person_name_rules(self):
        self.assertEqual(validate_person_name("O'Brien"), "O'Brien")
        self.assertEqual(validate_person_name(""), "")
        with self.assertRaises(ValidationError):
            validate_person_name("Name<script>")

    def test_title_required(self):
        self.assertEqual(validate_title("  My project  "), "My project")
        with self.assertRaises(ValidationError):
            validate_title("   ")

    def test_code_rules(self):
        self.assertEqual(validate_code("BL-01"), "BL-01")
        with self.assertRaises(ValidationError):
            validate_code("-bad")

    def test_username_from_email_local(self):
        self.assertEqual(username_from_email_local("john.doe@example.com"), "john_doe")
