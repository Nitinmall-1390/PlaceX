import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import { User } from './src/models/User.js';
import { Student } from './src/models/Student.js';
import { RefreshToken } from './src/models/RefreshToken.js';
import { authService } from './src/services/auth.service.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placex';

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 PLACEX GOOGLE & PHONE AUTH VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let total = 4;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Test Phone OTP User Creation & Session Generation
    const testPhone = '+919999988888';
    await User.deleteOne({ phoneNumber: testPhone });

    const phoneResult = await authService.phoneLogin(null, testPhone, 'STUDENT');
    if (phoneResult.user && phoneResult.accessToken && phoneResult.refreshToken) {
      console.log('✅ [PASS] 1. Phone Login creates user, student profile, and issues PlaceX JWT pair');
      passed++;
    } else {
      console.log('❌ [FAIL] 1. Phone Login failed to generate valid session');
    }

    // 2. Test Phone Login idempotency (existing user login)
    const phoneLoginExisting = await authService.phoneLogin(null, testPhone, 'STUDENT');
    if (phoneLoginExisting.user.id.toString() === phoneResult.user.id.toString()) {
      console.log('✅ [PASS] 2. Phone Login authenticates existing user without duplicating records');
      passed++;
    } else {
      console.log('❌ [FAIL] 2. Phone Login duplicated user record');
    }

    // 3. Test Student profile linked to phone user
    const studentProfile = await Student.findOne({ user: phoneResult.user.id });
    if (studentProfile && studentProfile.studentId) {
      console.log(`✅ [PASS] 3. Student profile linked (${studentProfile.studentId})`);
      passed++;
    } else {
      console.log('❌ [FAIL] 3. Student profile was not auto-created');
    }

    // 4. Test User Schema supports googleId & optional passwordHash
    const googleUserEmail = 'google.test.student@gmail.com';
    await User.deleteOne({ email: googleUserEmail });

    const newGoogleUser = await User.create({
      name: 'Google Test User',
      email: googleUserEmail,
      googleId: 'google_oauth_sub_123456789',
      authProvider: 'GOOGLE',
      role: 'STUDENT',
      isVerified: true,
    });

    const googleTokens = await authService.generateTokenPair(newGoogleUser);
    if (googleTokens.accessToken && googleTokens.refreshToken) {
      console.log('✅ [PASS] 4. Google OAuth user created without password and issued tokens');
      passed++;
    } else {
      console.log('❌ [FAIL] 4. Google OAuth user token generation failed');
    }

    // Cleanup test records
    await User.deleteOne({ phoneNumber: testPhone });
    await User.deleteOne({ email: googleUserEmail });
    await Student.deleteOne({ user: phoneResult.user.id });
    await Student.deleteOne({ user: newGoogleUser._id });

    console.log('\n==================================================');
    console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
