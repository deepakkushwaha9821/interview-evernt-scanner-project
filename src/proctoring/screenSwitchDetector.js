export function detectScreenSwitch(sendEvent){

  window.addEventListener("blur", () => {

    sendEvent({
      type: "screen_switch"
    });

  });

}