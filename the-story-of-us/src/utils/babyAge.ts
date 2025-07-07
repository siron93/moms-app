export function calculateBabyAge(birthDate: number): string {
  const now = Date.now();
  const ageInDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
  
  if (ageInDays < 7) {
    return `${ageInDays} day${ageInDays !== 1 ? 's' : ''} old`;
  } else if (ageInDays < 30) {
    const weeks = Math.floor(ageInDays / 7);
    const days = ageInDays % 7;
    if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''} old`;
  } else if (ageInDays < 365) {
    const months = Math.floor(ageInDays / 30);
    const remainingDays = ageInDays % 30;
    const weeks = Math.floor(remainingDays / 7);
    if (weeks === 0) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
    return `${months} month${months !== 1 ? 's' : ''}, ${weeks} week${weeks !== 1 ? 's' : ''} old`;
  } else {
    const years = Math.floor(ageInDays / 365);
    const remainingDays = ageInDays % 365;
    const months = Math.floor(remainingDays / 30);
    if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} old`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
  }
}

export function formatRelativeDate(date: number): string {
  const now = Date.now();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 5) {
    return `${diffInMinutes} min ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    if (diffInHours === 1) {
      return '1 hour ago';
    } else {
      return `${diffInHours} hours ago`;
    }
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? 'Last week' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? 'Last month' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? 'Last year' : `${years} years ago`;
  }
}

export function calculateAgeAtDate(birthDate: number, targetDate: number): string {
  const ageInDays = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));
  
  if (ageInDays < 7) {
    return `${ageInDays} Day${ageInDays !== 1 ? 's' : ''} Old`;
  } else if (ageInDays < 30) {
    const weeks = Math.floor(ageInDays / 7);
    return `${weeks} Week${weeks !== 1 ? 's' : ''} Old`;
  } else if (ageInDays < 365) {
    const months = Math.floor(ageInDays / 30);
    return `${months} Month${months !== 1 ? 's' : ''} Old`;
  } else {
    const years = Math.floor(ageInDays / 365);
    const remainingDays = ageInDays % 365;
    const months = Math.floor(remainingDays / 30);
    if (months === 0) {
      return `${years} Year${years !== 1 ? 's' : ''} Old`;
    }
    return `${years}Y ${months}M Old`;
  }
}