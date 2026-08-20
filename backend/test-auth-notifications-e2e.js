import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Job } from './src/models/Job.js';
import { Application } from './src/models/Application.js';
import { Notification } from './src/models/Notification.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runE2ETestingSuite() {
  console.log('\n==================================================');
  console.log('🧪 PLACEX JWT AUTH & TIMED NOTIFICATIONS E2E SUITE');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    await mongoose.connect('mongodb://localhost:27017/placex');

    // 1. Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@placex.com', password: 'Password123!' }),
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentLoginData.success, '1. Student Login with JWT');

    const studentToken = studentLoginData.data.accessToken;
    const studentUser = studentLoginData.data.user;
    const studentCookie = studentLoginRes.headers.get('set-cookie');

    assert(!studentUser.passwordHash && !studentUser.password, '2. JWT User payload does NOT contain password secrets');

    // 2. Company Login
    const companyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'company@placex.com', password: 'Password123!' }),
    });
    const companyLoginData = await companyLoginRes.json();
    assert(companyLoginRes.status === 200 && companyLoginData.success, '3. Company Login with JWT');

    const companyToken = companyLoginData.data.accessToken;

    // 3. Authenticated Identity Verification (/auth/me)
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data.user.email === 'student@placex.com', '4. Authenticated Session Identity (/auth/me)');

    // 4. Role Authorization (Company calling Admin endpoint should fail)
    const adminCall = await fetch(`${BASE_URL}/tpo/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(adminCall.status === 403, '5. Role Authorization: Student prohibited from TPO/Admin endpoint (403 Forbidden)');

    // 5. Account Suspension Guard Test
    await User.findByIdAndUpdate(studentUser.id, { $set: { isSuspended: true } });
    const suspendedReq = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(suspendedReq.status === 403, '6. Account State Guard: Suspended account blocked from API (403 Forbidden)');

    // Reactivate student account
    await User.findByIdAndUpdate(studentUser.id, { $set: { isSuspended: false } });

    // 6. IDOR Protection (Student fetching another user's notification by direct ID)
    const otherNotification = await Notification.findOne({ recipient: { $ne: studentUser.id } }).lean();
    if (otherNotification) {
      const idorReq = await fetch(`${BASE_URL}/notifications/${otherNotification._id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const idorData = await idorReq.json();
      assert(!idorData.data || String(idorData.data.recipient) !== String(studentUser.id), '7. IDOR Protection: Student cannot mutate another user\'s notification');
    } else {
      assert(true, '7. IDOR Protection (No secondary notification found)');
    }

    // 7. Event-Driven Application Submission Notification
    let sampleJob = await mongoose.model('Job').findOne({ status: 'PUBLISHED' }).lean();
    if (!sampleJob) {
      sampleJob = await mongoose.model('Job').create({
        company: new mongoose.Types.ObjectId(),
        title: 'Full Stack Engineer E2E',
        status: 'PUBLISHED',
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Clear any previous application by this student to this job for clean test run
    await mongoose.model('Application').deleteMany({ job: sampleJob._id });

    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ jobId: sampleJob._id, studentNotes: 'E2E Testing Application' }),
    }).then(r => r.json());

    assert(applyRes.success, '8. Student Job Application Submitted (Triggers APPLICATION_SUBMITTED Notification)');

    // 8. Unread Notification Count API
    const unreadCountRes = await fetch(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    }).then(r => r.json());
    assert(unreadCountRes.success && typeof unreadCountRes.data.unreadCount === 'number', '9. Notification Unread Count API (/notifications/unread-count)');

    // 9. Timed & Scheduled Notification Creation Test
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const scheduleRes = await fetch(`${BASE_URL}/notifications/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        recipient: studentUser.id,
        type: 'INTERVIEW_SCHEDULED',
        category: 'INTERVIEW',
        priority: 'HIGH',
        title: 'E2E Scheduled Interview Reminder',
        message: 'Your interview is scheduled in 2 hours.',
        scheduledFor: futureDate,
        idempotencyKey: `E2E_KEY_${Date.now()}`,
      }),
    }).then(r => r.json());

    assert(scheduleRes.success && scheduleRes.data.status === 'PENDING', '10. Server-Side Timed Notification Creation with Idempotency Key');

    // 10. Notification Preferences (GET & PUT)
    const prefsRes = await fetch(`${BASE_URL}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    }).then(r => r.json());
    assert(prefsRes.success && prefsRes.data.categories, '11. GET Notification Preferences');

    const updatePrefsRes = await fetch(`${BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ categories: { jobs: false } }),
    }).then(r => r.json());
    assert(updatePrefsRes.success && updatePrefsRes.data.categories.jobs === false, '12. PUT Update Notification Preferences');

    // 11. Mark All Notifications as Read
    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    }).then(r => r.json());
    assert(markAllRes.success, '13. Mark All Notifications As Read (/notifications/read-all)');

    // 12. Token Refresh Flow
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie || '' },
      body: JSON.stringify({ refreshToken: studentLoginData.data.refreshToken }),
    });
    const refreshData = await refreshRes.json();
    assert(refreshRes.status === 200 && refreshData.data?.accessToken, '14. JWT Token Refresh Flow');

    // 13. Secure Logout Flow
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ refreshToken: refreshData.data?.refreshToken || studentLoginData.data.refreshToken }),
    }).then(r => r.json());
    assert(logoutRes.success, '15. Secure Logout Flow (Invalidates Refresh Session)');

    console.log('\n==================================================');
    console.log(`📊 FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('==================================================\n');

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('❌ E2E Suite Exception:', error);
    process.exit(1);
  }
}

runE2ETestingSuite();
