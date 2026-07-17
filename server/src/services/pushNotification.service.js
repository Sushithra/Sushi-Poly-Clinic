import User from '../models/User.js';
import { getFirebaseAdminMessaging } from './firebaseAdmin.js';

const toStringData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)]),
  );

export const sendPushToUser = async ({ userId, title, body, data = {} }) => {
  if (!userId || !title || !body) {
    return { sent: 0, skipped: true };
  }

  const messaging = getFirebaseAdminMessaging();
  if (!messaging) {
    return { sent: 0, skipped: true };
  }

  const user = await User.findById(userId).select('pushTokens name email role');
  const tokens = Array.isArray(user?.pushTokens) ? [...new Set(user.pushTokens.filter(Boolean))] : [];

  if (tokens.length === 0) {
    return { sent: 0, skipped: true };
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: toStringData(data),
  });

  const invalidTokens = [];
  response.responses.forEach((item, index) => {
    if (!item.success) {
      const code = item.error?.code || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
        invalidTokens.push(tokens[index]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { pushTokens: { $in: invalidTokens } } },
    );
  }

  return {
    sent: response.successCount,
    failed: response.failureCount,
  };
};
