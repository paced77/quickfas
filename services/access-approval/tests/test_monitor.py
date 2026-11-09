import hashlib
import json
import unittest
from unittest.mock import patch

import monitor

class MonitorTests(unittest.TestCase):
    def digest(self, value):
        return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()

    @patch("monitor.record_snapshot")
    @patch("monitor.get_latest")
    @patch("monitor.get_access_approval_settings")
    def test_first_snapshot_is_not_reported_as_change(self, get_settings, get_latest, record):
        settings = {"enrolledServices": ["service-a"]}
        get_settings.return_value = settings
        get_latest.return_value = None
        record.return_value = {"observedAt": "2026-01-01T00:00:00+00:00", "settingsSha256": self.digest(settings)}
        result = monitor.check_once()
        self.assertFalse(result["changed"])

    @patch("monitor.notify_change")
    @patch("monitor.record_snapshot")
    @patch("monitor.get_latest")
    @patch("monitor.get_access_approval_settings")
    def test_changed_settings_trigger_notification(self, get_settings, get_latest, record, notify):
        old = {"enrolledServices": ["service-a"]}
        current = {"enrolledServices": ["service-b"]}
        get_settings.return_value = current
        get_latest.return_value = {"settingsSha256": self.digest(old)}
        record.return_value = {"observedAt": "2026-01-01T00:00:00+00:00", "settingsSha256": self.digest(current)}
        result = monitor.check_once()
        self.assertTrue(result["changed"])
        notify.assert_called_once()

if __name__ == "__main__":
    unittest.main()
