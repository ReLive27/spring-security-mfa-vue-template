import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Spring Security MFA Vue'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
