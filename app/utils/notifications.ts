import { User } from '/Users/Admin/EasyMarket/backend/src/models/User';

// In a real application, you would use a proper email service or push notification system
async function sendNotification(user: User, message: string) {
  console.log(`Sending notification to ${user.email}: ${message}`);
  // Simulate notification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Notify a user of suspicious activity on their account, such as failed login attempts or unknown device logins.
 * @param user The user to notify.
 * @param activity A description of the suspicious activity.
 * @param details Additional metadata about the activity, such as the IP address or user agent.
 */
export async function notifyUserOfSuspiciousActivity(user: User, activity: string, details: Record<string, any>) {
  const message = `Suspicious activity detected on your account: ${activity}. Details: ${JSON.stringify(details)}. If this wasn't you, please contact support immediately.`;
  await sendNotification(user, message);
}
