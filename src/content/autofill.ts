/**
 * Auto-fill functionality for MFA codes.
 */
import type { MFAFieldDetection } from "@shared/types";

/**
 * Track which elements have already been auto-filled to prevent repeated
 * submissions when the popup component is recreated (e.g. on storage changes).
 */
const autoFilledElements = new WeakSet<HTMLInputElement>();

/**
 * Maximum number of auto-submit attempts per page before stopping.
 * Prevents triggering rate limits on sites like GitHub when submission fails
 * and the page reloads repeatedly.
 */
const MAX_AUTO_SUBMIT_ATTEMPTS = 2;

/**
 * SessionStorage key for tracking auto-submit attempts on the current page.
 */
const SUBMIT_ATTEMPTS_KEY = "authvault_submit_attempts";

/**
 * Get the number of auto-submit attempts for the current page.
 */
const getSubmitAttempts = (): number => {
    try {
        const data = sessionStorage.getItem(SUBMIT_ATTEMPTS_KEY);
        if (!data) return 0;
        const parsed = JSON.parse(data);
        // Only count attempts for the same URL path
        if (parsed.path === window.location.pathname) {
            return parsed.count;
        }
        return 0;
    } catch {
        return 0;
    }
};

/**
 * Increment the auto-submit attempt counter for the current page.
 */
const incrementSubmitAttempts = (): void => {
    try {
        const current = getSubmitAttempts();
        sessionStorage.setItem(SUBMIT_ATTEMPTS_KEY, JSON.stringify({
            path: window.location.pathname,
            count: current + 1,
        }));
    } catch {
        // Ignore storage errors
    }
};

/**
 * Check if auto-submit is allowed (under the max attempt limit).
 */
const canAutoSubmit = (): boolean => {
    return getSubmitAttempts() < MAX_AUTO_SUBMIT_ATTEMPTS;
};

/**
 * Check if an element has already been auto-filled.
 */
export const hasBeenAutoFilled = (element: HTMLInputElement): boolean => {
    return autoFilledElements.has(element);
};

/**
 * Mark an element as having been auto-filled.
 */
export const markAutoFilled = (element: HTMLInputElement): void => {
    autoFilledElements.add(element);
};

/**
 * Fill an MFA code into the detected field(s) and optionally submit.
 * @param force - If true, bypass the auto-fill guard (used for user-initiated fills).
 */
export const fillCode = (detection: MFAFieldDetection, code: string, autoSubmit = true, force = false): void => {
    // Guard: don't auto-fill+submit if this element was already handled.
    // This prevents repeated submissions when the popup component is recreated
    // (e.g. on storage changes triggering refreshIcon). User-initiated fills
    // (force=true) bypass this guard.
    if (!force && autoFilledElements.has(detection.element)) {
        return;
    }
    autoFilledElements.add(detection.element);

    if (detection.type === "split" && detection.splitInputs) {
        fillSplitInputs(detection.splitInputs, code);
    } else {
        fillSingleInput(detection.element, code);
    }

    // Auto-submit after a delay to let frameworks process the input events
    // and enable submit buttons (some frameworks need time for validation).
    // Respect the max attempt limit to avoid triggering rate limits.
    if (autoSubmit) {
        // User-initiated fills always submit; auto-fills check the limit.
        if (force || canAutoSubmit()) {
            incrementSubmitAttempts();
            setTimeout(() => {
                clickSubmitButton(detection.element);
            }, 300);
        } else {
            console.log("[AuthVault] Auto-submit skipped: max attempts reached for this page");
        }
    }
};

/**
 * Fill a single input field.
 */
const fillSingleInput = (input: HTMLInputElement, code: string): void => {
    // Focus the input
    input.focus();

    // Set the value
    input.value = code;

    // Trigger input events to notify frameworks
    triggerInputEvents(input);
};

/**
 * Fill split inputs (one character per field).
 */
const fillSplitInputs = (inputs: HTMLInputElement[], code: string): void => {
    const digits = code.split("");

    inputs.forEach((input, index) => {
        if (index < digits.length) {
            input.focus();
            input.value = digits[index]!;
            triggerInputEvents(input);
        }
    });

    // Focus the last filled input
    if (inputs.length > 0) {
        const lastIndex = Math.min(digits.length - 1, inputs.length - 1);
        inputs[lastIndex]?.focus();
    }
};

/**
 * Trigger input events to notify frameworks (React, Vue, Angular, etc.).
 */
const triggerInputEvents = (input: HTMLInputElement): void => {
    // Create and dispatch events
    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    const changeEvent = new Event("change", { bubbles: true, cancelable: true });

    // For React synthetic events
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
    )?.set;

    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, input.value);
    }

    input.dispatchEvent(inputEvent);
    input.dispatchEvent(changeEvent);

    // Also trigger keydown/keyup for some frameworks
    input.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, cancelable: true })
    );
    input.dispatchEvent(
        new KeyboardEvent("keyup", { bubbles: true, cancelable: true })
    );
};

/**
 * Clear an MFA field.
 */
export const clearField = (detection: MFAFieldDetection): void => {
    if (detection.type === "split" && detection.splitInputs) {
        detection.splitInputs.forEach((input) => {
            input.value = "";
            triggerInputEvents(input);
        });
    } else {
        detection.element.value = "";
        triggerInputEvents(detection.element);
    }
};

/**
 * Check if an element looks like a submit button based on text/attributes.
 */
const isLikelySubmitButton = (element: HTMLElement): boolean => {
    const text = element.textContent?.toLowerCase().trim() || "";
    const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
    const title = element.getAttribute("title")?.toLowerCase() || "";
    const className = element.className?.toLowerCase() || "";
    const id = element.id?.toLowerCase() || "";

    // Common submit button keywords
    const submitKeywords = [
        "submit", "verify", "confirm", "continue", "next",
        "sign in", "signin", "login", "log in", "authenticate",
        "send", "done", "ok", "go", "enter",
        // Chinese
        "验证", "确认", "提交", "继续", "登录", "登入", "下一步",
        // Japanese
        "確認", "送信", "ログイン", "次へ",
        // Korean
        "확인", "제출", "로그인", "다음",
    ];

    // Check text content, aria-label, and title
    for (const keyword of submitKeywords) {
        if (text.includes(keyword) || ariaLabel.includes(keyword) || title.includes(keyword)) {
            return true;
        }
    }

    // Check for primary/submit button classes
    const primaryClassPatterns = [
        "submit", "primary", "btn-primary", "cta", "action",
        "continue", "next", "confirm"
    ];
    for (const pattern of primaryClassPatterns) {
        if (className.includes(pattern) || id.includes(pattern)) {
            return true;
        }
    }

    return false;
};

/**
 * Submit a form safely, preferring requestSubmit (fires submit event / runs
 * validation) with a fallback to form.submit() for older browsers.
 */
const submitForm = (form: HTMLFormElement): void => {
    if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
    } else {
        form.submit();
    }
};

/**
 * Keywords that indicate a LOGIN/sign-in action rather than an MFA verification.
 * These should NOT be matched when auto-submitting an MFA code, because clicking
 * a "Sign In" button/link in the page header would navigate away from the 2FA
 * form and cause errors (e.g. GitLab 422).
 */
const LOGIN_ONLY_KEYWORDS = [
    "sign in", "signin", "login", "log in", "登录", "登入", "ログイン", "로그인",
];

/**
 * Like isLikelySubmitButton but excludes login-specific keywords.
 * Used for MFA auto-submit where we want "verify/confirm/continue" but NOT
 * navigation-style "sign in" buttons that belong to a different flow.
 */
const isMFASubmitButton = (element: HTMLElement): boolean => {
    const text = element.textContent?.toLowerCase().trim() || "";
    const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
    const title = element.getAttribute("title")?.toLowerCase() || "";

    // If the button text is ONLY a login keyword (not also a verify keyword),
    // skip it — it's likely a navigation link, not an MFA submit.
    for (const keyword of LOGIN_ONLY_KEYWORDS) {
        if (text.includes(keyword) || ariaLabel.includes(keyword) || title.includes(keyword)) {
            return false;
        }
    }

    return isLikelySubmitButton(element);
};

/**
 * Find and click the submit button associated with an MFA input.
 */
const clickSubmitButton = (input: HTMLInputElement): void => {
    const form = input.closest("form");

    // Strategy 1: Find submit button in the same form
    if (form) {
        // First try explicit submit buttons
        const submitButton = form.querySelector<HTMLButtonElement | HTMLInputElement>(
            'button[type="submit"], input[type="submit"]'
        );
        if (submitButton && !submitButton.disabled) {
            console.log("[AuthVault] Clicking submit button in form");
            submitButton.click();
            return;
        }

        // Then try buttons without type (default to submit in forms)
        const defaultButton = form.querySelector<HTMLButtonElement>('button:not([type])');
        if (defaultButton && !defaultButton.disabled) {
            console.log("[AuthVault] Clicking default button in form");
            defaultButton.click();
            return;
        }

        // Check all buttons in form for submit-like text (use MFA-safe check)
        const formButtons = form.querySelectorAll<HTMLButtonElement>("button");
        for (const button of formButtons) {
            if (!button.disabled && isLikelySubmitButton(button)) {
                console.log("[AuthVault] Clicking likely submit button in form:", button.textContent?.trim());
                button.click();
                return;
            }
        }

        // If we're in a form but all buttons are disabled, wait and retry once
        // (frameworks may need time to enable the button after input events).
        const disabledSubmit = form.querySelector<HTMLButtonElement | HTMLInputElement>(
            'button[type="submit"], input[type="submit"], button:not([type])'
        );
        if (disabledSubmit) {
            console.log("[AuthVault] Submit button is disabled, waiting to retry...");
            setTimeout(() => {
                if (!disabledSubmit.disabled) {
                    console.log("[AuthVault] Submit button enabled, clicking now");
                    disabledSubmit.click();
                } else {
                    // Last resort: submit the form directly
                    console.log("[Ente Auth] Submitting form directly (button still disabled)");
                    submitForm(form);
                }
            }, 300);
            return;
        }

        // No buttons at all in the form — submit it directly
        console.log("[Ente Auth] No buttons in form, submitting directly");
        submitForm(form);
        return;
    }

    // === Below strategies only apply when the input is NOT inside a <form> ===
    // (common in SPAs using React/Vue/Angular without real form elements)

    // Strategy 2: Walk up the DOM to find buttons in nearby containers
    // Limit to 5 levels to avoid reaching page-level navigation
    let container: HTMLElement | null = input.parentElement;
    const checkedContainers = new Set<HTMLElement>();

    for (let i = 0; i < 5 && container; i++) {
        if (checkedContainers.has(container)) {
            container = container.parentElement;
            continue;
        }
        checkedContainers.add(container);

        // Skip if we've reached a page-level container (header, nav, etc.)
        const tag = container.tagName.toLowerCase();
        if (tag === "header" || tag === "nav" || tag === "aside") {
            break;
        }

        const clickables = container.querySelectorAll<HTMLElement>(
            'button, input[type="submit"], input[type="button"], [role="button"]'
        );

        for (const element of clickables) {
            if (element.hasAttribute("disabled") ||
                element.getAttribute("aria-disabled") === "true") {
                continue;
            }

            // Use MFA-safe check to avoid clicking "Sign In" nav buttons
            if (isMFASubmitButton(element)) {
                console.log("[Ente Auth] Clicking nearby button:", element.textContent?.trim());
                element.click();
                return;
            }
        }

        container = container.parentElement;
    }

    // Strategy 3 (conservative): Only look for buttons that are clearly MFA
    // submit actions — skip login/sign-in buttons entirely.
    const allButtons = document.querySelectorAll<HTMLElement>(
        'button, input[type="submit"], [role="button"]'
    );

    for (const button of allButtons) {
        if (button.hasAttribute("disabled") ||
            button.getAttribute("aria-disabled") === "true" ||
            button.offsetParent === null) {
            continue;
        }

        if (isMFASubmitButton(button)) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log("[Ente Auth] Clicking visible MFA submit button:", button.textContent?.trim());
                button.click();
                return;
            }
        }
    }

    console.log("[Ente Auth] No submit button found");
};
