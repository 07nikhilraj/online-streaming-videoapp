require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const Video = require('./src/models/Video');
const User = require('./src/models/User');
const AuditLog = require('./src/models/AuditLog');

const DEFAULT_ORG = 'org_main';

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🚀 Connected to MongoDB for Migration...');

    // 1. Fix Users
    const usersToFix = await User.find({ organizationId: { $exists: false } });
    console.log(`Found ${usersToFix.length} users missing organizationId.`);
    if (usersToFix.length > 0) {
      const userRes = await User.updateMany(
        { organizationId: { $exists: false } },
        { $set: { organizationId: DEFAULT_ORG } }
      );
      console.log(`✅ Updated ${userRes.modified_count} Users.`);
    }

    // 2. Fix Videos
    // We also fix the 'isShared' and 'allowedViewers' fields while we are at it
    const videosToFix = await Video.find({ organizationId: { $exists: false } });
    console.log(`Found ${videosToFix.length} videos missing organizationId.`);
    if (videosToFix.length > 0) {
      const videoRes = await Video.updateMany(
        { organizationId: { $exists: false } },
        { 
          $set: { 
            organizationId: DEFAULT_ORG,
            isShared: false,
            allowedViewers: [] 
          } 
        }
      );
      console.log(`✅ Updated ${videoRes.modified_count} Videos.`);
    }

    // 3. Fix Audit Logs
    const logsToFix = await AuditLog.find({ organizationId: { $exists: false } });
    console.log(`Found ${logsToFix.length} logs missing organizationId.`);
    if (logsToFix.length > 0) {
      const logRes = await AuditLog.updateMany(
        { organizationId: { $exists: false } },
        { $set: { organizationId: DEFAULT_ORG } }
      );
      console.log(`✅ Updated ${logRes.modified_count} Audit Logs.`);
    }

    console.log('--- Migration Successful: All data is now Multi-Tenant compliant ---');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  });