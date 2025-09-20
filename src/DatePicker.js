import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

import { Calendar } from './Calendar';
import DatePickerInput from './DatePickerInput';
import { getValueType } from './shared/generalUtils';
import { TYPE_SINGLE_DATE, TYPE_MUTLI_DATE, TYPE_RANGE } from './shared/constants';

const DatePicker = ({
  value,
  onChange,
  formatInputText,
  inputPlaceholder,
  inputClassName,
  inputName,
  inputId,
  renderInput,
  wrapperClassName = '',
  calendarClassName,
  calendarTodayClassName,
  calendarSelectedDayClassName,
  calendarRangeStartClassName,
  calendarRangeBetweenClassName,
  calendarRangeEndClassName,
  calendarPopperPosition = 'auto',
  disabledDays,
  onDisabledDayError,
  colorPrimary,
  colorPrimaryLight,
  slideAnimationDuration,
  minimumDate,
  maximumDate,
  selectorStartingYear,
  selectorEndingYear,
  locale = 'en',
  shouldHighlightWeekends,
  renderFooter,
  customDaysClassName,
  disabled = false,
  touch = false,
}) => {
  const calendarContainerElement = useRef(null);
  const inputElement = useRef(null);
  const shouldPreventToggle = useRef(false);
  const [isCalendarOpen, setCalendarVisiblity] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleBlur = () => {
      setCalendarVisiblity(false);
    };
    window.addEventListener('blur', handleBlur, false);
    return () => {
      if (window) {
        window.removeEventListener('blur', handleBlur, false);
      }
    };
  }, []);

  // handle input focus/blur
  useEffect(() => {
    const valueType = getValueType(value);
    if (valueType === TYPE_MUTLI_DATE) return; // no need to close the calendar
    const shouldCloseCalendar =
      valueType === TYPE_SINGLE_DATE ? !isCalendarOpen : !isCalendarOpen && value.from && value.to;
    if (shouldCloseCalendar) inputElement.current.blur();
  }, [value, isCalendarOpen]);

  const handleBlur = e => {
    e.persist();
    if (!isCalendarOpen) return;
    const isInnerElementFocused = calendarContainerElement.current.contains(e.relatedTarget);
    if (shouldPreventToggle.current) {
      shouldPreventToggle.current = false;
      inputElement.current.focus();
    } else if (isInnerElementFocused && e.relatedTarget) {
      e.relatedTarget.focus();
    } else {
      setCalendarVisiblity(false);
    }
  };

  const openCalendar = () => {
    if (!shouldPreventToggle.current) setCalendarVisiblity(true);
  };

  // Keep the calendar in the screen bounds if input is near the window edges
  useLayoutEffect(() => {
    if (!isCalendarOpen) return;
    const { left, width, height, top } = calendarContainerElement.current.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const isOverflowingFromRight = left + width > clientWidth;
    const isOverflowingFromLeft = left < 0;
    const isOverflowingFromBottom = top + height > clientHeight;

    const getLeftStyle = () => {
      const overflowFromRightDistance = left + width - clientWidth;

      if (!isOverflowingFromRight && !isOverflowingFromLeft) return;
      const overflowFromLeftDistance = Math.abs(left);
      const rightPosition = isOverflowingFromLeft ? overflowFromLeftDistance : 0;

      const leftStyle = isOverflowingFromRight
        ? `calc(50% - ${overflowFromRightDistance}px)`
        : `calc(50% + ${rightPosition}px)`;
      return leftStyle;
    };

    calendarContainerElement.current.style.left = getLeftStyle();
    if (
      (calendarPopperPosition === 'auto' && isOverflowingFromBottom) ||
      calendarPopperPosition === 'top'
    ) {
      calendarContainerElement.current.classList.add('-top');
    }
  }, [isCalendarOpen]);

  const handleCalendarChange = newValue => {
    const valueType = getValueType(value);
    onChange(newValue);
    if (valueType === TYPE_SINGLE_DATE) setCalendarVisiblity(false);
    else if (valueType === TYPE_RANGE && newValue.from && newValue.to) setCalendarVisiblity(false);
  };

  const handleKeyUp = ({ key }) => {
    switch (key) {
      case 'Enter':
        setCalendarVisiblity(true);
        break;
      case 'Escape':
        setCalendarVisiblity(false);
        shouldPreventToggle.current = true;
        break;
    }
  };

  useEffect(() => {
    if (!isCalendarOpen && shouldPreventToggle.current) {
      inputElement.current.focus();
      shouldPreventToggle.current = false;
    }
  }, [shouldPreventToggle, isCalendarOpen]);

  useEffect(() => {
    function updatePosition() {
      if (!inputElement.current) return;

      const rect = inputElement.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Measure popup height dynamically
      const popupEl = document.querySelector('.DatePicker__calendarContainer');
      const popupHeight = popupEl ? popupEl.offsetHeight : 400;

      // Available space
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      if (spaceBelow >= popupHeight) {
        top = rect.bottom + window.scrollY;
      } else if (spaceAbove >= popupHeight) {
        top = rect.top + window.scrollY - popupHeight;
      } else {
        top = rect.bottom + window.scrollY;
      }

      setPosition({
        top,
        left: rect.left + window.scrollX,
        centered: false,
      });
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [inputElement, touch]);

  return (
    <div
      onFocus={openCalendar}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      className={`DatePicker ${wrapperClassName}`}
      role="presentation"
    >
      <DatePickerInput
        ref={inputElement}
        inputId={inputId}
        formatInputText={formatInputText}
        value={value}
        inputPlaceholder={inputPlaceholder}
        inputClassName={inputClassName}
        renderInput={renderInput}
        inputName={inputName}
        locale={locale}
        disabled={disabled}
      />
      {isCalendarOpen && (
        <>
          {ReactDOM.createPortal(
            <>
              {touch ? (
                <div
                  className="DatePicker__calendarOverlay"
                  style={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: '100vh',
                    zIndex: 999999,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  }}
                ></div>
              ) : null}
              <div
                ref={calendarContainerElement}
                className={`DatePicker__calendarContainer ${touch ? 'touch' : ''}`}
                data-testid="calendar-container"
                role="presentation"
                onMouseDown={() => {
                  shouldPreventToggle.current = true;
                }}
                anchorref={inputElement}
                style={{
                  position: touch ? 'fixed' : 'absolute',
                  top: touch ? '50%' : position.top,
                  left: touch ? '50%' : position.left,
                  zIndex: 1000000,
                  transform: touch ? 'translate(-50%, -50%)' : 'translate(0, 0)',
                }}
              >
                <Calendar
                  value={value}
                  onChange={handleCalendarChange}
                  calendarClassName={calendarClassName}
                  calendarTodayClassName={calendarTodayClassName}
                  calendarSelectedDayClassName={calendarSelectedDayClassName}
                  calendarRangeStartClassName={calendarRangeStartClassName}
                  calendarRangeBetweenClassName={calendarRangeBetweenClassName}
                  calendarRangeEndClassName={calendarRangeEndClassName}
                  disabledDays={disabledDays}
                  colorPrimary={colorPrimary}
                  colorPrimaryLight={colorPrimaryLight}
                  slideAnimationDuration={slideAnimationDuration}
                  onDisabledDayError={onDisabledDayError}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  selectorStartingYear={selectorStartingYear}
                  selectorEndingYear={selectorEndingYear}
                  locale={locale}
                  shouldHighlightWeekends={shouldHighlightWeekends}
                  renderFooter={renderFooter}
                  customDaysClassName={customDaysClassName}
                />
              </div>
            </>,
            document.body,
          )}
          <div className="DatePicker__calendarArrow" />
        </>
      )}
    </div>
  );
};

export default DatePicker;
