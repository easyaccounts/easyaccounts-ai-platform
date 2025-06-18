
// UI Constants
export const UI_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA_FOUND: 'No data found',
  SAVING: 'Saving...',
  CREATING: 'Creating...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  SUCCESS_CREATED: 'Created successfully',
  SUCCESS_UPDATED: 'Updated successfully',
  SUCCESS_DELETED: 'Deleted successfully',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',
  ERROR_FIRM_DETECTION: 'Unable to detect your firm — please refresh or contact support.',
  ERROR_VALIDATION: 'Please check the form for errors.',
} as const;

// Business Logic Constants
export const BUSINESS_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_DEBOUNCE_DELAY: 300,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Status Constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// User Roles
export const USER_ROLES = {
  PARTNER: 'partner',
  SENIOR_STAFF: 'senior_staff',
  STAFF: 'staff',
  CLIENT: 'client',
  MANAGEMENT: 'management',
} as const;

// User Groups
export const USER_GROUPS = {
  ACCOUNTING_FIRM: 'accounting_firm',
  BUSINESS_OWNER: 'business_owner',
} as const;

// Time Constants
export const TIME = {
  REDIRECT_DELAY: 100,
  TOAST_DURATION: 5000,
  POLLING_INTERVAL: 30000,
} as const;
