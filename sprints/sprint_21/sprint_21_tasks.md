# Sprint 21 Tasks

## Goals
- Implement internationalization (i18n) in WellSync AI to support multiple languages
- Ensure the application UI can be displayed in English, Spanish, Vietnamese, and Portuguese
- Create an intuitive language switcher component

## Tasks

### Setup and Configuration
- [x] Choose and implement i18n library (react-i18next)
- [x] Configure i18n with supported languages (English, Spanish, Vietnamese, Portuguese)
- [x] Set up locale detection based on URL path

### Translation Resources
- [x] Create translation files for English (en) locale
- [x] Create translation files for Spanish (es) locale
- [x] Create translation files for Vietnamese (vi) locale
- [x] Create translation files for Portuguese (pt) locale

### UI Components
- [x] Create language switcher dropdown component
  - [x] Match language dropdown styling with blue toolbar background
  - [x] Use native language names in dropdown menu
- [x] Fix snake_case to camelCase conversion in fault type translations
- [x] Ensure all messages are properly extracted for translation

### Testing and Validation
- [x] Test UI in all supported languages
- [x] Verify all components render correctly with translated text
- [x] Fix translation-related bugs (fault type translations)
- [x] Ensure proper fallback to default language when translation is missing

### Deployment
- [x] Resolve build issues with translated content
- [x] Fix dependency issues (tr46 module) 