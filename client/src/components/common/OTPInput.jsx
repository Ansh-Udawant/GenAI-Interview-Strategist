import { useEffect, useRef, useState } from "react";
import { useTheme } from "./useTheme";

/**
 * 6-digit numeric OTP input component with auto-focus, paste support, and resend cooldown timer.
 *
 * @param {Object} props
 * @param {number} [props.length] - Length of OTP (default 6).
 * @param {string} [props.value] - Controlled OTP value string.
 * @param {Function} props.onChange - Callback fired when OTP changes.
 * @param {Function} [props.onResend] - Callback fired when resend OTP is clicked.
 * @param {boolean} [props.loading] - Disabled state flag during submission.
 * @param {number} [props.resendCooldown] - Cooldown timer in seconds (default 45).
 * @returns {React.ReactElement}
 */

export function OTPInput({

  length = 6,
  value = "",
  onChange,
  onResend,
  loading = false,
  resendCooldown = 45

}) {

  const [timer, setTimer] = useState(resendCooldown);
  const inputRefs = useRef([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Compute OTP digits from value prop
  const valArr = value.split("").slice(0, length);
  const otp = Array(length).fill("");
  valArr.forEach((char, i) => {
    otp[i] = char;
  });

  const canResend = timer === 0;

  // 45-second Resend Cooldown Timer
  useEffect(() => {

    let interval = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {

      if (interval) clearInterval(interval);

    };

  }, [timer]);

  const handleChange = (index, e) => {

    const val = e.target.value;
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);

    const combinedValue = newOtp.join("");
    onChange(combinedValue);

    // Auto-advance to next input box
    if (val && index < length - 1 && inputRefs.current[index + 1]) {

      inputRefs.current[index + 1].focus();

    }
  };

  const handleKeyDown = (index, e) => {

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {

        inputRefs.current[index - 1].focus();

      }

    }

  };

  const handlePaste = (e) => {

    e.preventDefault();

    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newOtp = Array(length).fill("");
    digits.forEach((digit, i) => {

      newOtp[i] = digit;

    });
    onChange(newOtp.join(""));

    const nextFocusIndex = Math.min(digits.length, length - 1);
    if (inputRefs.current[nextFocusIndex]) {

      inputRefs.current[nextFocusIndex].focus();

    }

  };

  const handleResendClick = () => {

    if (!canResend || loading) return;

    setTimer(resendCooldown);

    if (onResend) onResend();

  };

  const formatTimer = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
        {otp.map((digit, index) => (

          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-8 h-10 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-bold rounded-lg border transition-all disabled:opacity-50 focus:outline-none ${
              isDark
                ? "bg-[#09090b] border-zinc-800 text-zinc-100 focus:border-zinc-500"
                : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400"
            }`}
          />
          
        ))}
      </div>

      {onResend && (
        <div className={`flex items-center gap-2 text-xs mt-1 ${
          isDark ? "text-zinc-400" : "text-zinc-500"
        }`}>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={loading}
              className={`font-semibold underline underline-offset-4 disabled:opacity-50 cursor-pointer transition-colors ${
                isDark ? "text-white hover:text-zinc-200" : "text-zinc-900 hover:text-zinc-700"
              }`}
            >
              Resend OTP
            </button>
          ) : (
            <span>Resend OTP in <strong className={`font-semibold ${
              isDark ? "text-zinc-200" : "text-zinc-800"
            }`}>{formatTimer(timer)}</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
