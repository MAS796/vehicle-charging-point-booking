#!/usr/bin/env python
"""Backward-compatible wrapper for admin bootstrap."""

from create_admin import create_default_admin


if __name__ == "__main__":
    try:
        raise SystemExit(create_default_admin())
    except RuntimeError as exc:
        print(f"[ERROR] {exc}")
        print("Set ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD, then rerun.")
        raise SystemExit(1)
