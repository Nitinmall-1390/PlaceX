import mongoose from 'mongoose';
import { ATSService } from './src/services/ats.service.js';

async function debug() {
  await mongoose.connect('mongodb://localhost:27017/placex');
  const atsService = new ATSService();
  
  try {
    const result = await atsService.analyzeResume('6a7d66483a412a9ef267ee98', '6a7d6f56b85460b28c0bbf6e', {});
    console.log('ATS Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('ATS Error:', e.message);
    console.error(e.stack);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
