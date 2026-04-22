export function detectScreenSwitch(sendEvent){
  const handleBlur = () => {
    sendEvent({
      type: "screen_switch"
    });
  };

  window.addEventListener("blur", handleBlur);

  return () => {
    window.removeEventListener("blur", handleBlur);
  };

}