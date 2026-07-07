import { useEffect } from "react";
import useNotificationStore from "../store/NotificationStore";

export default function ToastContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => removeNotification(notification.id), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 99999,
        maxWidth: 360,
        pointerEvents: "none",
      }}
    >
      {notifications.map((notification) => {
        const isError = notification.type === "ERROR";
        const isSuccess = notification.type === "SUCCESS";

        let borderLeftColor = "#3B82F6"; // Info Blue
        let iconColor = "#60A5FA";
        let typeText = "INFO";
        if (isError) {
          borderLeftColor = "#EF4444"; // Error Red
          iconColor = "#F87171";
          typeText = "ERROR";
        } else if (isSuccess) {
          borderLeftColor = "#10B981"; // Success Green
          iconColor = "#34D399";
          typeText = "SUCCESS";
        }

        return (
          <div
            key={notification.id}
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              color: "#E2E8F0",
              background: "rgba(15, 23, 42, 0.85)", // Dark glass background
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderLeft: `5px solid ${borderLeftColor}`,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              pointerEvents: "auto",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              animation: "toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Custom SVG Icon based on type */}
            <div
              style={{
                marginTop: 2,
                color: iconColor,
                display: "flex",
                alignItems: "center",
              }}
            >
              {isSuccess && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isError && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {!isSuccess && !isError && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: iconColor,
                }}
              >
                {typeText}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: "1.4",
                  fontWeight: 500,
                }}
              >
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                padding: 0,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        );
      })}

      {/* Dynamic Keyframes injected into DOM */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateY(12px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
