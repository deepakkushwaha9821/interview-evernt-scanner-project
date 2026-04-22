export function detectTabSwitch(sendEvent){
  const handleVisibilityChange = () => {
    if (document.hidden) {
      sendEvent({
        type: "tab_switch"
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

}