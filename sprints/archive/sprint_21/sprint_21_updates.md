# Sprint 21 Updates

* **2023-07-22**: Initialized sprint. Reverted codebase to end of Sprint 20 (commit d089456) due to persistent i18n build errors with next-intl in Sprint 21 attempt 1.
* **2023-07-22**: Goal is to re-attempt i18n implementation using an alternative library like react-i18next.
* **2023-07-23**: Successfully implemented basic i18n infrastructure with react-i18next and next-intl. Created translation files for English and Spanish.
* **2023-07-24**: Extended i18n support to include Vietnamese and Portuguese languages. Created appropriate translation files with fully translated content.
* **2023-07-25**: Implemented a dropdown-based language switcher component to replace the previous button-based design, making the UI more compact.
* **2023-07-25**: Fixed issues with fault type translations by properly converting snake_case keys to camelCase format.
* **2023-07-26**: Resolved build issues related to missing tr46 module dependency and improved the styling of the language switcher to match the application's blue toolbar.
* **2023-07-26**: Completed final testing of all languages across major components and verified that the application properly translates all UI elements. 