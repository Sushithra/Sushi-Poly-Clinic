import admin from 'firebase-admin';

let adminApp = null;

const parseServiceAccount = () => {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '';

  if (rawJson) {
    try {
      const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      return {
        projectId: parsed.projectId || parsed.project_id,
        clientEmail: parsed.clientEmail || parsed.client_email,
        privateKey: String(parsed.privateKey || parsed.private_key || '').replace(/\\n/g, '\n'),
      };
    } catch (error) {
      console.warn('Unable to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

export const getFirebaseAdminApp = () => {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  adminApp = admin.apps.length > 0
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

  return adminApp;
};

export const getFirebaseAdminMessaging = () => {
  const app = getFirebaseAdminApp();
  if (!app) {
    return null;
  }

  return admin.messaging(app);
};
