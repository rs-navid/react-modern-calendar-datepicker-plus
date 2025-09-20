# react-modern-calendar-datepicker-plus

This is a fixed and extended version of the original react-modern-calendar-datepicker component.
This is a **fixed** and **extended** version of the original `react-modern-calendar-datepicker` component.This package is fixing a bug that caused **Cannot read property 'removeEventListener' of null**, also new features added to component.

The original component can be found at [react-modern-calendar-datepicker](https://www.npmjs.com/package/react-modern-calendar-datepicker).

For more details, please refer to the original documentation [here](https://www.npmjs.com/package/react-modern-calendar-datepicker).


# Modifications

## Added Props
- **inputId (string):**
Sets the id attribute for the input element.
Useful for accessibility, form labels, or testing.

- **disabled (boolean):**
When true, disables the trigger element and prevents opening the popup.
Default: false.

- **touch (boolean):**
Controls the display mode of the popup.
false → Acts like a dropdown, positioned relative to the input element with automatic repositioning (above or below depending on available space).
true → Acts like a dialog, centered in the viewport regardless of the anchor element.
Default: false.

# Installation
```bash
npm i react-modern-calendar-datepicker-plus
```

# Usage
```js
import DatePicker from "react-modern-calendar-datepicker-plus";
import "react-modern-calendar-datepicker-plus/lib/DatePicker.css";
```