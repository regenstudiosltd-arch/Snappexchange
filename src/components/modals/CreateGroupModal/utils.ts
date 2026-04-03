import { AxiosError } from 'axios';
import { CONTRIBUTION_MAX } from './constants';
import { CreateGroupForm } from './types';

/** Returns an error string or empty string if valid. */
export const validateContributionAmount = (value: string): string => {
  if (!value) return '';
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) return 'Amount must be greater than 0.';
  if (amount > CONTRIBUTION_MAX)
    return `Amount cannot exceed ₵${CONTRIBUTION_MAX.toLocaleString()}.`;
  return '';
};

/**
 * Converts the live-photo data-URL to a File, throwing if it's empty.
 * This keeps the blob→File logic out of the component.
 */
export const livePictureToFile = async (dataUrl: string): Promise<File> => {
  const blob = await fetch(dataUrl).then((r) => r.blob());
  if (blob.size === 0) throw new Error('Empty image');
  return new File([blob], `live_photo_${Date.now()}.jpg`, {
    type: 'image/jpeg',
  });
};

/** Builds the FormData payload that the API expects. */
export const buildPayload = async (
  form: CreateGroupForm,
  livePictureData: string,
): Promise<FormData> => {
  const payload = new FormData();

  payload.append('group_name', form.groupName);
  payload.append('contribution_amount', form.contributionAmount);
  payload.append('frequency', form.contributionFrequency.toLowerCase());
  payload.append(
    'payout_timeline_days',
    form.payoutTimeline.replace(/[^0-9]/g, '') || '30',
  );
  payload.append('expected_members', form.memberCount);
  if (form.groupDescription) {
    payload.append('description', form.groupDescription);
  }
  if (form.ghanaCardFront) {
    payload.append('kyc.ghana_card_front', form.ghanaCardFront);
  }
  if (form.ghanaCardBack) {
    payload.append('kyc.ghana_card_back', form.ghanaCardBack);
  }

  const liveFile = await livePictureToFile(livePictureData);
  payload.append('kyc.live_photo', liveFile);

  return payload;
};

/** Extracts a user-readable error string from a failed API mutation. */
export const extractApiError = (
  error: AxiosError<{
    error?: string;
    detail?: string;
    [key: string]: unknown;
  }>,
): string => {
  const data = error?.response?.data;
  if (!data) return 'Failed to create group. Please try again.';

  // Field-level validation errors take priority
  const fieldEntry = Object.entries(data).find(
    ([key]) => !['error', 'detail'].includes(key),
  );
  if (fieldEntry) {
    const [key, messages] = fieldEntry;
    const msg = Array.isArray(messages) ? messages[0] : String(messages);
    return `${key.replace(/_/g, ' ')}: ${msg}`;
  }

  return (
    data.error || data.detail || 'Failed to create group. Please try again.'
  );
};

/** Summary row helper used in Step3Review. */
export const formatContributionSummary = (
  amount: string,
  frequency: string,
): string =>
  amount && frequency
    ? `₵${parseFloat(amount).toLocaleString()} · ${frequency}`
    : '—';
