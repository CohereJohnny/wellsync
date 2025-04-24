# Sprint 21 Test Plan

## Goals

* Verify correct translation rendering for chosen i18n library (react-i18next)
* Ensure language switching works correctly for all supported languages
* Confirm no build errors related to i18n setup
* Validate UI appearance in all languages

## Test Cases

### Basic Functionality

* **TC-I18N-001:** Verify English text rendering on key pages/components.
  * **Result:** ✅ All components correctly display English text

* **TC-I18N-002:** Verify Spanish text rendering after switching language.
  * **Result:** ✅ All components correctly display Spanish text

* **TC-I18N-003:** Verify Vietnamese text rendering after switching language.
  * **Result:** ✅ All components correctly display Vietnamese text

* **TC-I18N-004:** Verify Portuguese text rendering after switching language.
  * **Result:** ✅ All components correctly display Portuguese text

### Language Switching

* **TC-I18N-005:** Test language switcher dropdown UI appearance.
  * **Result:** ✅ Dropdown matches blue toolbar styling and displays properly

* **TC-I18N-006:** Verify language switching via URL change.
  * **Result:** ✅ Changing locale in URL properly updates the displayed language

* **TC-I18N-007:** Verify language switching via dropdown menu.
  * **Result:** ✅ Selecting language from dropdown correctly updates URL and language

### Component-Specific Tests

* **TC-I18N-008:** Verify Well Cards display translated status, camp and formation labels.
  * **Result:** ✅ Well Cards show correct translations for all text elements

* **TC-I18N-009:** Verify Toolbar filters show translated options.
  * **Result:** ✅ All filter options display in the selected language

* **TC-I18N-010:** Test fault simulation modal with translated fault types.
  * **Result:** ✅ Fault types correctly display in the selected language after fixing snake_case conversion

* **TC-I18N-011:** Test error messages and validation in forms.
  * **Result:** ✅ Error messages display in the selected language

### Build and Performance

* **TC-I18N-012:** Confirm `pnpm run build` completes successfully.
  * **Result:** ✅ Application builds without error after fixing tr46 dependency issue

* **TC-I18N-013:** Verify page load performance is acceptable with i18n.
  * **Result:** ✅ No noticeable performance degradation with translations added

### Edge Cases

* **TC-I18N-014:** Test fallback to English for any missing translations.
  * **Result:** ✅ System properly falls back to English for any missing keys

* **TC-I18N-015:** Verify long text strings don't break UI layout.
  * **Result:** ✅ UI accommodates longer text in all languages without layout issues 